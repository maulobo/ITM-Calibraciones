import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { Cron } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JwtPayload } from "src/auth/interfaces/jwt-payload.interface";
import { CertificateService } from "src/certificates/certificate.service";
import { InstrumentSoonExpiredSender } from "src/email/senders/instrument-soon-expired.sender";
import { NewInstrumentSender } from "src/email/senders/new-instrument.sender";
import { IEquipmentTypes } from "src/equipment-types/interfaces/equipment-types.interface";
import { QRService } from "src/qr/qr.service";
import { UsersService } from "src/users/users.service";
import { AddEquipmentCommand } from "./commands/add-equipment.command";
import { UpdateInstrumentCommand } from "./commands/update-instrument.command";
import { AddEquipmentDTO } from "./dto/add-equipment.dto";
import { GetInstrumentsDTO } from "./dto/get-instruments.dto";
import { RegisterCalibrationDto } from "./dto/register-calibration.dto";
import { RegisterTechnicalResultDto } from "./dto/register-technical-result.dto";
import { UpdateInstrumentReceivedDTO } from "./dto/update-instrument-received.dto";
import { UpdateInstrumentDTO } from "./dto/update-instrument.dto";
import { IEquipment } from "./interfaces/equipment.interface";
import { FindAllEquipmentsQuery } from "./queries/get-all-equipment.query";
import { BlockTypeEnum, EquipmentTechnicalStateEnum, EquipmentLogisticStateEnum } from "./const.enum";
import { DeliverEquipmentDto } from "./dto/deliver-equipment.dto";
import { EmailService } from "src/email/email.service";
import { EmailTemplate } from "src/email/enum/email-template.enum";
import { ServiceOrderEntity } from "src/service-orders/schemas/service-order.schema";

// Resultados que indican que el equipo ya no puede ser trabajado:
// se pasa automáticamente a READY_TO_DELIVER para que el cliente lo retire
const AUTO_READY_RESULTS = [
  EquipmentTechnicalStateEnum.OUT_OF_SERVICE,
  EquipmentTechnicalStateEnum.RETURN_WITHOUT_CALIBRATION,
];

@Injectable()
export class EquipmentService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly qrService: QRService,
    @Inject(forwardRef(() => CertificateService))
    private certificateService: CertificateService,
    private userService: UsersService,
    private newInstrumentSender: NewInstrumentSender,
    private emailInstrumentSoonExpiredSender: InstrumentSoonExpiredSender,
    private readonly emailService: EmailService,
    @InjectModel("Equipment")
    private readonly equipmentModel: Model<IEquipment>,
    @InjectModel("ServiceOrder")
    private readonly serviceOrderModel: Model<ServiceOrderEntity>,
  ) {}

  @Cron("0 6 * * *")
  async notifyInstrumentSoonExpired() {
    const inXdays = new Date();
    inXdays.setDate(inXdays.getDate() + 30);
    inXdays.setUTCHours(0, 0, 0, 0);
    const params: GetInstrumentsDTO = {
      calibrationExpirationDate: inXdays,
      orWhere: [{ values: [false, undefined], field: "outOfService" }],
      populate: ["model"],
    };
    const instruments = await this.getAllEquipments(params);

    console.log(`Instruments soon expired: ${instruments.length}`);

    for (const instrument of instruments) {
      const usersToNotify = await this.userService.findUser({
        office: instrument.office,
      });
      console.log(
        `Instruments ${instrument.serialNumber}, usersToNotify: ${usersToNotify.length}`,
      );
      // Populate equipmentType manualmente si es necesario
      await this.equipmentModel.populate(instrument, {
        path: "model",
        populate: { path: "equipmentType" },
      });
      const instrumentType =
        (instrument.model as any).equipmentType?.type || "Instrumento";
      try {
        await this.emailInstrumentSoonExpiredSender.sendBulkEmail({
          bulk: usersToNotify,
          subject: `Calibración pronta a vencer, ${instrumentType} N/S: ${instrument.serialNumber}`,
          locals: {
            instrumentType: instrumentType,
            serialNumber: instrument.serialNumber,
          },
        });
      } catch (e) {
        console.log(`Error sending new Instrument Bulk`);
        console.log(e);
      }
    }
  }

  async addEquipment(addEquipmentDTO: AddEquipmentDTO) {
    const { sendEmailNotification } = addEquipmentDTO;
    const BACK_URL = process.env.BACK_URL;
    const instrument = await this.commandBus.execute(
      new AddEquipmentCommand(addEquipmentDTO),
    );
    const qr = await this.qrService.generateQRCode(
      `${BACK_URL}/instruments/qr/${instrument.id}`,
    );
    const updateInstrumentDTO: UpdateInstrumentDTO = {
      ...addEquipmentDTO,
      id: new Types.ObjectId(instrument.id),
      qr,
    };

    if (sendEmailNotification) {
      const usersToNotify = await this.userService.findUser({
        office: instrument.office,
      });
      const instrumentType =
        (instrument.model as any).equipmentType?.type || "Instrumento";
      try {
        this.newInstrumentSender.sendBulkEmail({
          bulk: usersToNotify,
          subject: `Nuevo ${instrumentType} creado N/S: ${instrument.serialNumber}`,
          locals: {
            instrumentType: instrumentType,
            serialNumber: instrument.serialNumber,
          },
        });
      } catch (e) {
        console.log(`Error sending new Instrument Bulk`);
        console.log(e);
      }
    }

    return await this.updateInstrument(updateInstrumentDTO);
  }

  async updateInstrument(updateInstrumentDTO: UpdateInstrumentDTO) {
    return this.commandBus.execute(
      new UpdateInstrumentCommand(updateInstrumentDTO),
    );
  }

  async getAllEquipments(params: GetInstrumentsDTO): Promise<IEquipment[]> {
    return this.queryBus.execute(new FindAllEquipmentsQuery(params));
  }

  async instrumentUserAccess(
    user: JwtPayload,
    instrument: IEquipment,
  ): Promise<boolean> {
    const userOffice = user.office;
    return instrument.office?._id.toString() === userOffice;
  }

  async updateInstrumentReceivedStatus(
    updateInstrumentReceivedDTO: UpdateInstrumentReceivedDTO,
  ): Promise<IEquipment> {
    const { received, id } = updateInstrumentReceivedDTO;
    const instruments = await this.getAllEquipments({
      _id: id,
      populate: ["model", "office.client"],
    });
    // Populate equipmentType después
    await this.equipmentModel.populate(instruments, {
      path: "model",
      populate: { path: "equipmentType brand" },
    });
    const instrument = instruments[0];
    if (received) {
      // Put expirationDate as undefined
      instrument.calibrationExpirationDate = undefined;
    }

    if (!received) {
      // Take the last expirationDate and put in the instrument
      const certificates = await this.certificateService.getCertificate({
        equipment: id,
      });
      const newExpiratinDate = certificates[0].calibrationExpirationDate;
      instrument.calibrationExpirationDate = newExpiratinDate;
    }
    return await instrument.save();
  }

  async searchBySerial(q: string, clientId?: string, tag?: string): Promise<IEquipment[]> {
    const filter: Record<string, any> = {};
    if (tag) {
      filter.tag = { $regex: tag, $options: "i" };
    } else {
      filter.serialNumber = { $regex: q, $options: "i" };
    }
    if (clientId) {
      filter.client = new Types.ObjectId(clientId);
    }
    return this.equipmentModel
      .find(filter)
      .populate({ path: "model", populate: [{ path: "brand" }, { path: "equipmentType" }] })
      .limit(15)
      .lean() as unknown as IEquipment[];
  }

  async findById(id: string): Promise<IEquipment> {
    return this.equipmentModel
      .findById(id)
      .populate({ path: "model", populate: [{ path: "brand" }, { path: "equipmentType" }] })
      .populate("office")
      .lean() as unknown as IEquipment;
  }

  async registerCalibration(
    id: string,
    dto: RegisterCalibrationDto,
    technician: JwtPayload,
  ): Promise<IEquipment> {
    const equipment = await this.equipmentModel.findById(id).lean();
    if (!equipment) throw new NotFoundException(`Equipo ${id} no encontrado`);

    // Find the serviceHistory entry matching the current active service order
    let historyIndex = -1;
    if (equipment.serviceHistory) {
      for (let i = equipment.serviceHistory.length - 1; i >= 0; i--) {
        if (equipment.serviceHistory[i].serviceOrder?.toString() === equipment.serviceOrder?.toString()) {
          historyIndex = i;
          break;
        }
      }
    }

    const setOps: Record<string, any> = {
      technicalState: EquipmentTechnicalStateEnum.CALIBRATED,
      calibrationDate: dto.calibrationDate,
      calibrationExpirationDate: dto.calibrationExpirationDate,
      usedStandards: dto.usedStandards ?? [],
    };

    if (dto.certificateNumber) {
      setOps.certificateNumber = dto.certificateNumber;
    }

    if (historyIndex >= 0) {
      setOps[`serviceHistory.${historyIndex}.calibrationDate`] = dto.calibrationDate;
      setOps[`serviceHistory.${historyIndex}.calibrationExpirationDate`] = dto.calibrationExpirationDate;
      setOps[`serviceHistory.${historyIndex}.technicalResult`] = EquipmentTechnicalStateEnum.CALIBRATED;
      setOps[`serviceHistory.${historyIndex}.usedStandards`] = dto.usedStandards ?? [];
      setOps[`serviceHistory.${historyIndex}.technicianId`] = technician.id;
      setOps[`serviceHistory.${historyIndex}.technicianName`] = `${technician.name} ${technician.lastName}`;
      if (dto.certificateNumber) {
        setOps[`serviceHistory.${historyIndex}.certificateNumber`] = dto.certificateNumber;
      }
    }

    const updated = await this.equipmentModel
      .findByIdAndUpdate(id, { $set: setOps }, { new: true })
      .populate({ path: "model", populate: [{ path: "brand" }, { path: "equipmentType" }] })
      .populate("office")
      .lean() as unknown as IEquipment;

    await this.appendHistory(id, {
      action: 'CALIBRATED',
      label: 'Calibración registrada',
      performedBy: `${technician.name} ${technician.lastName}`.trim(),
      performedById: technician.id,
    });

    return updated;
  }

  private readonly BLOCK_TYPE_LABELS: Record<string, string> = {
    BROKEN:                    'Equipo roto / no funciona',
    NEEDS_PART:                'Requiere repuesto',
    NEEDS_EXTERNAL_MAINTENANCE:'Requiere mantenimiento externo',
    OTHER:                     'Otro motivo',
  };

  async sendBlockNotification(id: string): Promise<void> {
    const equipment = await this.equipmentModel
      .findById(id)
      .populate({ path: 'model', populate: [{ path: 'brand' }, { path: 'equipmentType' }] })
      .lean();

    if (!equipment) throw new NotFoundException(`Equipo ${id} no encontrado`);
    if (equipment.technicalState !== EquipmentTechnicalStateEnum.BLOCKED) {
      throw new BadRequestException(`El equipo no está frenado`);
    }
    if (!equipment.serviceOrder) {
      throw new BadRequestException(`El equipo no tiene una OT activa`);
    }

    const order = await this.serviceOrderModel
      .findById(equipment.serviceOrder)
      .lean();

    if (!order || !order.contacts?.length) {
      throw new BadRequestException(`La OT no tiene contactos para notificar`);
    }

    const model = equipment.model as any;
    const equipmentLabel = [
      model?.equipmentType?.type,
      model?.brand?.name,
      model?.name,
    ].filter(Boolean).join(' · ');

    const locals = {
      otCode:        equipment.otCode ?? '—',
      equipmentLabel,
      serialNumber:  equipment.serialNumber,
      blockTypeLabel: this.BLOCK_TYPE_LABELS[(equipment as any).blockType] ?? 'Sin especificar',
      blockReason:   (equipment as any).blockReason ?? null,
      portalLink:    equipment.serviceOrder
                       ? `${process.env.FRONT_URL ?? ''}/portal/orders/${equipment.serviceOrder.toString()}`
                       : null,
    };

    const html = await this.emailService.compileTemplate(
      EmailTemplate.EQUIPMENT_BLOCKED,
      locals,
    );

    const subject = `Equipo frenado en laboratorio — ${equipment.otCode ?? equipment.serialNumber}`;

    for (const contact of order.contacts) {
      if (contact.email) {
        await this.emailService.sendEmail({ to: contact.email, subject, html });
      }
    }
  }

  async unblockEquipment(id: string, technician: JwtPayload): Promise<IEquipment> {
    const equipment = await this.equipmentModel.findById(id);
    if (!equipment) throw new NotFoundException(`Equipo ${id} no encontrado`);
    if (equipment.technicalState !== EquipmentTechnicalStateEnum.BLOCKED) {
      throw new BadRequestException(`El equipo no está en estado BLOCKED`);
    }

    const updated = await this.equipmentModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            technicalState: EquipmentTechnicalStateEnum.IN_PROCESS,
            logisticState: EquipmentLogisticStateEnum.IN_LABORATORY,
            blockReason: undefined,
          },
          $unset: { blockReason: "" },
        },
        { new: true },
      )
      .populate({ path: "model", populate: [{ path: "brand" }, { path: "equipmentType" }] })
      .populate("office")
      .lean() as unknown as IEquipment;

    await this.appendHistory(id, {
      action: 'UNBLOCKED',
      label: 'Frenado levantado',
      performedBy: `${technician.name} ${technician.lastName}`.trim(),
      performedById: technician.id,
    });

    return updated;
  }

  async registerTechnicalResult(
    id: string,
    dto: RegisterTechnicalResultDto,
    technician: JwtPayload,
  ): Promise<IEquipment> {
    const equipment = await this.equipmentModel.findById(id).lean();
    if (!equipment) throw new NotFoundException(`Equipo ${id} no encontrado`);

    // Find the serviceHistory entry matching the current active service order
    let historyIndex = -1;
    if (equipment.serviceHistory) {
      for (let i = equipment.serviceHistory.length - 1; i >= 0; i--) {
        if (
          equipment.serviceHistory[i].serviceOrder?.toString() ===
          equipment.serviceOrder?.toString()
        ) {
          historyIndex = i;
          break;
        }
      }
    }

    const setOps: Record<string, any> = {
      technicalState: dto.technicalResult,
    };

    // BLOCKED: pasar logístico a ON_HOLD y guardar tipo + detalle
    if (dto.technicalResult === EquipmentTechnicalStateEnum.BLOCKED) {
      setOps.logisticState = EquipmentLogisticStateEnum.ON_HOLD;
      setOps.blockType = dto.blockType;
      setOps.blockReason = dto.blockReason ?? null;
    } else {
      // Limpiar campos de freno si se sale del estado BLOCKED
      setOps.blockType = null;
      setOps.blockReason = null;
    }

    // OUT_OF_SERVICE and RETURN_WITHOUT_CALIBRATION auto-transition to READY_TO_DELIVER
    if (AUTO_READY_RESULTS.includes(dto.technicalResult as any)) {
      setOps.logisticState = EquipmentLogisticStateEnum.READY_TO_DELIVER;
    }

    if (historyIndex >= 0) {
      setOps[`serviceHistory.${historyIndex}.technicalResult`] = dto.technicalResult;
      setOps[`serviceHistory.${historyIndex}.technicianId`]    = technician.id;
      setOps[`serviceHistory.${historyIndex}.technicianName`]  =
        `${technician.name} ${technician.lastName}`;
      if (dto.observations) {
        setOps[`serviceHistory.${historyIndex}.exitObservations`] = dto.observations;
      }
    }

    const TECHNICAL_RESULT_LABELS: Record<string, string> = {
      CALIBRATED:                 'Calibración registrada',
      BLOCKED:                    'Equipo frenado',
      OUT_OF_SERVICE:             'Dado de baja (fuera de servicio)',
      RETURN_WITHOUT_CALIBRATION: 'Devolución sin calibrar',
      VERIFIED:                   'Verificación registrada',
      MAINTENANCE:                'Mantenimiento registrado',
    };

    const updated = await this.equipmentModel
      .findByIdAndUpdate(id, { $set: setOps }, { new: true })
      .populate({ path: "model", populate: [{ path: "brand" }, { path: "equipmentType" }] })
      .populate("office")
      .lean() as unknown as IEquipment;

    await this.appendHistory(id, {
      action: dto.technicalResult,
      label: TECHNICAL_RESULT_LABELS[dto.technicalResult] ?? dto.technicalResult,
      performedBy: `${technician.name} ${technician.lastName}`.trim(),
      performedById: technician.id,
      notes: dto.observations ?? undefined,
    });

    return updated;
  }

  async cleanInstrumentUserAccess(
    user: JwtPayload,
    instrumentes: IEquipment[],
  ): Promise<IEquipment[]> {
    const filteredInstruments = await Promise.all(
      instrumentes.map(async (instrument) => {
        const hasAccess = await this.instrumentUserAccess(user, instrument);
        return hasAccess ? instrument : null;
      }),
    );

    return filteredInstruments.filter((instrument) => instrument !== null);
  }

  async appendHistory(
    id: string,
    entry: { action: string; label?: string; performedBy?: string; performedById?: any; notes?: string },
  ): Promise<void> {
    await this.equipmentModel.findByIdAndUpdate(id, {
      $push: { actionHistory: { ...entry, at: new Date() } },
    });
  }

  async deliverEquipment(id: string, dto: DeliverEquipmentDto, user: JwtPayload): Promise<IEquipment> {
    const equipment = await this.equipmentModel.findById(id).lean();
    if (!equipment) throw new NotFoundException(`Equipo ${id} no encontrado`);
    if (equipment.logisticState !== EquipmentLogisticStateEnum.READY_TO_DELIVER) {
      throw new BadRequestException('El equipo no está en estado Listo para Retiro');
    }

    const performedBy = `${user.name} ${user.lastName}`.trim();

    const setOps: Record<string, any> = {
      logisticState: EquipmentLogisticStateEnum.DELIVERED,
      deliveredTo: dto.deliveredTo,
    };
    if (dto.retireDate)        setOps.retireDate        = dto.retireDate;
    if (dto.remittanceNumber)  setOps.remittanceNumber  = dto.remittanceNumber;
    if (dto.certificateNumber) setOps.certificateNumber = dto.certificateNumber;

    return this.equipmentModel
      .findByIdAndUpdate(
        id,
        {
          $set:  setOps,
          $push: { actionHistory: { action: 'DELIVERED', label: `Entregado a ${dto.deliveredTo}`, performedBy, performedById: user.id, at: new Date() } },
        },
        { new: true },
      )
      .populate({ path: 'model', populate: [{ path: 'brand' }, { path: 'equipmentType' }] })
      .populate('office')
      .lean() as unknown as IEquipment;
  }

  async clientRequestReturn(id: string, user: JwtPayload): Promise<IEquipment> {
    const equipment = await this.equipmentModel.findById(id).populate('office').lean();
    if (!equipment) throw new NotFoundException(`Equipo ${id} no encontrado`);

    // Verify the equipment belongs to the requesting client's office
    if ((equipment.office as any)?._id?.toString() !== user.office) {
      throw new ForbiddenException('No tenés acceso a este equipo');
    }

    if (equipment.technicalState !== EquipmentTechnicalStateEnum.BLOCKED) {
      throw new BadRequestException('El equipo no está en estado FRENADO');
    }

    const updated = await this.equipmentModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            technicalState: EquipmentTechnicalStateEnum.RETURN_WITHOUT_CALIBRATION,
            logisticState: EquipmentLogisticStateEnum.READY_TO_DELIVER,
            blockType: null,
            blockReason: null,
          },
        },
        { new: true },
      )
      .populate({ path: 'model', populate: [{ path: 'brand' }, { path: 'equipmentType' }] })
      .populate('office')
      .lean() as unknown as IEquipment;

    await this.appendHistory(id, {
      action: 'CLIENT_RETURN_REQUEST',
      label: 'Cliente solicitó devolución sin calibrar',
      performedBy: `${user.name} ${user.lastName}`.trim(),
      performedById: user.id,
    });

    return updated;
  }
}

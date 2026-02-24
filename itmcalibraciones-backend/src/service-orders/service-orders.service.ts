import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ServiceOrderEntity,
  ServiceOrderState,
  VALID_TRANSITIONS,
} from "./schemas/service-order.schema";
import { EquipmentEntity } from "../equipment/schemas/equipment.schema";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import { UpdateServiceOrderDto } from "./dto/update-service-order.dto";
import {
  EquipmentTechnicalStateEnum,
  EquipmentLogisticStateEnum,
} from "../equipment/const.enum";

// Estados técnicos que permiten considerar un equipo como "terminado"
// Grupo "trabajo realizado": CALIBRATED, VERIFIED, MAINTENANCE
// Grupo "sin calibración":   RETURN_WITHOUT_CALIBRATION, OUT_OF_SERVICE
const TERMINAL_TECHNICAL_STATES: string[] = [
  EquipmentTechnicalStateEnum.CALIBRATED,
  EquipmentTechnicalStateEnum.VERIFIED,
  EquipmentTechnicalStateEnum.MAINTENANCE,
  EquipmentTechnicalStateEnum.OUT_OF_SERVICE,
  EquipmentTechnicalStateEnum.RETURN_WITHOUT_CALIBRATION,
];

// Estados logísticos "activos" — el equipo está ocupado en una orden en curso.
// Solo DELIVERED indica que fue devuelto al cliente y puede ingresar de nuevo.
const ACTIVE_LOGISTIC_STATES: string[] = [
  EquipmentLogisticStateEnum.RECEIVED,
  EquipmentLogisticStateEnum.IN_LABORATORY,
  EquipmentLogisticStateEnum.EXTERNAL,
  EquipmentLogisticStateEnum.ON_HOLD,
  EquipmentLogisticStateEnum.READY_TO_DELIVER,
];

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectModel("ServiceOrder")
    private readonly serviceOrderModel: Model<ServiceOrderEntity>,
    @InjectModel("Equipment")
    private readonly equipmentModel: Model<EquipmentEntity>,
  ) {}

  async create(createServiceOrderDto: CreateServiceOrderDto, user: any) {
    try {
      // 1. Generate Incremental Code (Ej: "OT-26-0001")
      const year = new Date().getFullYear().toString().slice(-2);
      const lastOrder = await this.serviceOrderModel
        .findOne({ code: new RegExp(`^OT-${year}-`) })
        .sort({ code: -1 });

      let sequence = 1;
      if (lastOrder) {
        const parts = lastOrder.code.split("-");
        if (parts.length === 3) {
          sequence = parseInt(parts[2], 10) + 1;
        }
      }
      const code = `OT-${year}-${sequence.toString().padStart(4, "0")}`;

      // 2. Create Service Order with initial status history entry
      const newOrder = new this.serviceOrderModel({
        code,
        client: createServiceOrderDto.client,
        office: createServiceOrderDto.office,
        contacts: createServiceOrderDto.contacts ?? [],
        observations: createServiceOrderDto.observations,
        estimatedDeliveryDate: createServiceOrderDto.estimatedDeliveryDate,
        equipments: [],
        statusHistory: [
          {
            from: null,
            to: ServiceOrderState.PENDING,
            changedById: user?.id ?? user?._id,
            changedByName: user ? `${user.name} ${user.lastName}` : "Sistema",
            changedAt: new Date(),
          },
        ],
      });
      await newOrder.save();

      // 3. Validate: no equipment should be in an active logistic state
      const conflicting: string[] = [];
      for (const item of createServiceOrderDto.items) {
        const existing = await this.equipmentModel.findOne({
          serialNumber: item.serialNumber,
          model: new Types.ObjectId(item.model),
          client: new Types.ObjectId(createServiceOrderDto.client),
        });
        if (existing && ACTIVE_LOGISTIC_STATES.includes(existing.logisticState)) {
          conflicting.push(
            `S/N ${item.serialNumber} (estado: ${existing.logisticState}, OT: ${existing.otCode ?? "—"})`,
          );
        }
      }
      if (conflicting.length > 0) {
        // Remove the newly created order before throwing
        await this.serviceOrderModel.findByIdAndDelete(newOrder._id);
        throw new BadRequestException(
          `No se puede crear la orden. Los siguientes equipos ya tienen una orden activa: ${conflicting.join(", ")}. Deben ser entregados al cliente antes de crear una nueva orden.`,
        );
      }

      // 4. Process Equipments
      const equipmentIds = [];

      for (const [index, item] of createServiceOrderDto.items.entries()) {
        // Identidad única: S/N + modelo + cliente (empresa dueña del equipo)
        // Evita colisiones entre distintas empresas con el mismo S/N
        // Convertimos explícitamente a ObjectId para evitar que Mongoose guarde strings
        const filter = {
          serialNumber: item.serialNumber,
          model: new Types.ObjectId(item.model),
          client: new Types.ObjectId(createServiceOrderDto.client),
        };

        const updateData = {
          model: new Types.ObjectId(item.model),
          client: new Types.ObjectId(createServiceOrderDto.client),
          office: new Types.ObjectId(createServiceOrderDto.office),
          range: item.range,
          tag: item.tag,
          serviceOrder: newOrder._id,
          orderIndex: index,
          otCode: `${code}-${index + 1}`,
          technicalState: EquipmentTechnicalStateEnum.PENDING,
          logisticState: EquipmentLogisticStateEnum.RECEIVED,
        };

        const eq = await this.equipmentModel.findOneAndUpdate(
          filter,
          {
            $set: updateData,
            $push: {
              serviceHistory: {
                serviceOrder: newOrder._id,
                otCode: `${code}-${index + 1}`,
                entryDate: new Date(),
                entryObservations: item.observations || undefined,
              },
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        );

        equipmentIds.push(eq._id);
      }

      // 5. Update Order with Equipments
      newOrder.equipments = equipmentIds;
      await newOrder.save();

      return newOrder;
    } catch (error) {
      // Re-throw known HTTP exceptions (BadRequestException, etc.) as-is
      if (error?.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(clientId?: string) {
    const filter = clientId ? { client: clientId } : {};
    return this.serviceOrderModel
      .find(filter)
      .populate("client")
      .populate("office")
      .populate({
        path: "equipments",
        select: "serialNumber technicalState logisticState tag orderIndex otCode",
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string) {
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { code: id };
    const doc = await this.serviceOrderModel
      .findOne(query)
      .populate("client")
      .populate("office")
      .populate({
        path: "equipments",
        select:
          "serialNumber model technicalState logisticState tag orderIndex otCode range description serviceHistory",
        populate: {
          path: "model",
          populate: [{ path: "brand" }, { path: "equipmentType" }],
        },
      })
      .exec();
    return doc ? doc.toObject({ virtuals: true }) : null;
  }

  async updateStatus(id: string, dto: UpdateServiceOrderDto, user: any) {
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { code: id };

    // 1. Fetch current order
    const current = await this.serviceOrderModel
      .findOne(query)
      .populate("equipments", "technicalState")
      .exec();

    if (!current) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }

    const fromState = current.generalStatus as ServiceOrderState;
    const toState = dto.generalStatus as ServiceOrderState;

    // 2. Validate transition is allowed
    if (toState && toState !== fromState) {
      const allowed = VALID_TRANSITIONS[fromState] ?? [];
      if (!allowed.includes(toState)) {
        throw new BadRequestException(
          `Transición inválida: no se puede pasar de ${fromState} a ${toState}`,
        );
      }

      // 3. Gate for FINISHED: all equipment must be in terminal technical state
      if (toState === ServiceOrderState.FINISHED) {
        const equipments = current.equipments as any[];
        const notReady = equipments.filter(
          (eq) => !TERMINAL_TECHNICAL_STATES.includes(eq.technicalState),
        );
        if (notReady.length > 0) {
          throw new BadRequestException(
            `No se puede finalizar la orden: ${notReady.length} equipo(s) aún no están en estado terminal (calibrado, verificado, fuera de servicio o devuelto sin calibrar)`,
          );
        }
      }
    }

    // 4. Build history entry
    const historyEntry = {
      from: fromState,
      to: toState,
      changedById: user?.id ?? user?._id,
      changedByName: user ? `${user.name} ${user.lastName}` : "Sistema",
      changedAt: new Date(),
    };

    // 5. Update with new status + push to history
    const order = await this.serviceOrderModel
      .findOneAndUpdate(
        query,
        {
          $set: { generalStatus: toState },
          $push: { statusHistory: historyEntry },
        },
        { new: true },
      )
      .populate("client")
      .populate("office")
      .populate({
        path: "equipments",
        select:
          "serialNumber model technicalState logisticState tag orderIndex otCode range description serviceHistory",
        populate: {
          path: "model",
          populate: [{ path: "brand" }, { path: "equipmentType" }],
        },
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }
    return order.toObject({ virtuals: true });
  }
}

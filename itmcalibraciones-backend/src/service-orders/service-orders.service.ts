import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ServiceOrderEntity } from "./schemas/service-order.schema";
import { EquipmentEntity } from "../equipment/schemas/equipment.schema";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import {
  EquipmentTechnicalStateEnum,
  EquipmentLogisticStateEnum,
} from "../equipment/const.enum";

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectModel("ServiceOrder")
    private readonly serviceOrderModel: Model<ServiceOrderEntity>,
    @InjectModel("Equipment")
    private readonly equipmentModel: Model<EquipmentEntity>,
  ) {}

  async create(createServiceOrderDto: CreateServiceOrderDto, user: any) {
    // TODO: Re-enable transactions when using MongoDB Replica Set in production
    // const session = await this.serviceOrderModel.db.startSession();
    // session.startTransaction();
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

      // 2. Create Service Order
      const newOrder = new this.serviceOrderModel({
        code,
        client: createServiceOrderDto.client,
        office: createServiceOrderDto.office,
        contact: createServiceOrderDto.contact,
        observations: createServiceOrderDto.observations,
        estimatedDeliveryDate: createServiceOrderDto.estimatedDeliveryDate,
        equipments: [],
      });
      await newOrder.save();

      // 3. Process Equipments - Crear o actualizar cada equipo
      const equipmentIds = [];

      for (const [index, item] of createServiceOrderDto.items.entries()) {
        // 🧠 UPSERT INTELIGENTE:
        // Busca por Serial + Modelo (independiente de la oficina)
        // Si el equipo ya existe, actualiza su ubicación actual
        const filter = {
          serialNumber: item.serialNumber,
          model: item.model,
        };

        // Datos a actualizar/crear
        const updateData = {
          model: item.model,
          office: createServiceOrderDto.office, // 🔥 Actualiza office si cambió de ubicación
          range: item.range,
          tag: item.tag,
          serviceOrder: newOrder._id,
          orderIndex: index,
          technicalState: EquipmentTechnicalStateEnum.TO_CALIBRATE,
          logisticState: EquipmentLogisticStateEnum.RECEIVED,
        };

        // findOneAndUpdate con upsert: true
        // - Si existe (mismo serial+modelo): Actualiza y mueve de oficina si es necesario
        // - Si no existe: Lo crea nuevo
        const eq = await this.equipmentModel.findOneAndUpdate(
          filter,
          { $set: updateData },
          {
            new: true, // Devuelve documento actualizado
            upsert: true, // Crea si no existe
            setDefaultsOnInsert: true, // Aplica defaults del schema si es nuevo
          },
        );

        equipmentIds.push(eq._id);
      }

      // 4. Update Order with Equipments
      newOrder.equipments = equipmentIds;
      await newOrder.save();

      // await session.commitTransaction();
      return newOrder;
    } catch (error) {
      // await session.abortTransaction();
      throw new InternalServerErrorException(error.message);
    }
    // finally {
    //   session.endSession();
    // }
  }

  async findAll() {
    return this.serviceOrderModel
      .find()
      .populate("client")
      .populate({
        path: "equipments",
        select:
          "serialNumber model technicalState logisticState tag orderIndex",
        populate: { path: "model", populate: { path: "equipmentType" } },
      })
      .lean();
  }

  async findOne(id: string) {
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { code: id };
    return this.serviceOrderModel
      .findOne(query)
      .populate("client")
      .populate({
        path: "equipments",
        select:
          "serialNumber model technicalState logisticState tag orderIndex range description",
        populate: { path: "model", populate: { path: "equipmentType" } },
      })
      .lean();
  }
}

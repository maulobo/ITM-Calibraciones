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
    @InjectModel(ServiceOrderEntity.name)
    private readonly serviceOrderModel: Model<ServiceOrderEntity>,
    @InjectModel(EquipmentEntity.name)
    private readonly equipmentModel: Model<EquipmentEntity>,
  ) {}

  async create(createServiceOrderDto: CreateServiceOrderDto, user: any) {
    const session = await this.serviceOrderModel.db.startSession();
    session.startTransaction();
    try {
      // 1. Generate Incremental Code
      const year = new Date().getFullYear().toString().slice(-2);
      const lastOrder = await this.serviceOrderModel
        .findOne({ code: new RegExp(`^OT-${year}-`) })
        .sort({ code: -1 })
        .session(session);

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
        ...createServiceOrderDto,
        code,
        equipments: [],
      });
      await newOrder.save({ session });

      // 3. Process Equipments
      const equipmentIds = [];
      const userOffice = user.office;

      if (!userOffice) {
        throw new Error("User office is required to register equipment.");
      }

      for (const item of createServiceOrderDto.items) {
        const updateData = {
          model: item.model,
          instrumentType: item.instrumentType,
          range: item.range,
          description: item.description,
          office: userOffice,
          serviceOrder: newOrder._id,
          technicalState: EquipmentTechnicalStateEnum.TO_CALIBRATE,
          logisticState: EquipmentLogisticStateEnum.RECEIVED,
        };

        const eq = await this.equipmentModel.findOneAndUpdate(
          { serialNumber: item.serialNumber, office: userOffice },
          { $set: updateData },
          { new: true, upsert: true, session },
        );
        equipmentIds.push(eq._id);
      }

      // 4. Update Order with Equipments
      newOrder.equipments = equipmentIds;
      await newOrder.save({ session });

      await session.commitTransaction();
      return newOrder;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    return this.serviceOrderModel
      .find()
      .populate("client")
      .populate("equipments");
  }

  async findOne(id: string) {
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { code: id };
    return this.serviceOrderModel
      .findOne(query)
      .populate("client")
      .populate({
        path: "equipments",
        populate: { path: "model" },
      });
  }
}

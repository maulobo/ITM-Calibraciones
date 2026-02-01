import { Cron } from "@nestjs/schedule";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IStandardEquipment } from "./interfaces/standard-equipment.interface";
import { CreateStandardEquipmentDto } from "./dto/create-standard-equipment.dto";
import { UpdateStandardEquipmentDto } from "./dto/update-standard-equipment.dto";
import { StandardStatus } from "./schemas/standard-equipment.schema";

@Injectable()
export class StandardEquipmentService {
  constructor(
    @InjectModel("StandardEquipment")
    private readonly standardEquipmentModel: Model<IStandardEquipment>,
  ) {}

  async create(
    createDto: CreateStandardEquipmentDto,
  ): Promise<IStandardEquipment> {
    const created = new this.standardEquipmentModel(createDto);

    // If created with a certificate, maybe add to history immediately or just keep in current?
    // Let's just keep in current for now.

    return await created.save();
  }

  async findAll(): Promise<IStandardEquipment[]> {
    return await this.standardEquipmentModel
      .find()
      .populate("brand")
      .populate("model")
      .exec();
  }

  async findOne(id: string): Promise<IStandardEquipment> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ID");

    const found = await this.standardEquipmentModel
      .findById(id)
      .populate("brand")
      .populate("model")
      .exec();

    if (!found) {
      throw new NotFoundException(`Standard Equipment with ID ${id} not found`);
    }
    return found;
  }

  async update(
    id: string,
    updateDto: UpdateStandardEquipmentDto,
  ): Promise<IStandardEquipment> {
    const existing = await this.findOne(id);

    // Logic: If updating certificate info (new calibration),
    // archive the EXISTING one into history before updating.
    const isNewCalibration =
      updateDto.certificate && updateDto.certificate !== existing.certificate;

    if (isNewCalibration) {
      // Archive current if it exists
      if (existing.certificate) {
        existing.certificateHistory.push({
          certificate: existing.certificate,
          uploadDate: new Date(), // archiving date
          expirationDate: existing.calibrationExpirationDate,
        });
      }
    }

    // Apply updates
    Object.assign(existing, updateDto);

    // Auto-update status based on dates if not explicitly set?
    // If expiration date is future -> ACTIVO (if it was VENCIDO)
    if (updateDto.calibrationExpirationDate) {
      const expDate = new Date(updateDto.calibrationExpirationDate);
      if (expDate > new Date() && existing.status === StandardStatus.VENCIDO) {
        existing.status = StandardStatus.ACTIVO;
      }
    }

    return await existing.save();
  }

  async remove(id: string): Promise<IStandardEquipment> {
    return await this.standardEquipmentModel.findByIdAndRemove(id);
  }

  // Run every day at midnight to check for expired equipment
  @Cron("0 0 * * *")
  async checkExpirations(): Promise<any> {
    console.log("Running Standard Equipment Expiration Check...");
    const now = new Date();
    const result = await this.standardEquipmentModel.updateMany(
      {
        calibrationExpirationDate: { $lt: now },
        status: { $ne: StandardStatus.VENCIDO },
      },
      {
        $set: { status: StandardStatus.VENCIDO },
      },
    );
    console.log(`Updated ${result.modifiedCount} expired standard equipments.`);
    return result;
  }
}

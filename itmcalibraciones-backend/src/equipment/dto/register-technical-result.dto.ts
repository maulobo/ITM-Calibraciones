import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { BlockTypeEnum, EquipmentTechnicalStateEnum } from "../const.enum";

// Estados técnicos posibles desde el laboratorio (sin calibración completa)
const NON_CALIBRATION_RESULTS = [
  EquipmentTechnicalStateEnum.BLOCKED,
  EquipmentTechnicalStateEnum.VERIFIED,
  EquipmentTechnicalStateEnum.MAINTENANCE,
  EquipmentTechnicalStateEnum.OUT_OF_SERVICE,
  EquipmentTechnicalStateEnum.RETURN_WITHOUT_CALIBRATION,
] as const;

export type NonCalibrationResult = (typeof NON_CALIBRATION_RESULTS)[number];

export class RegisterTechnicalResultDto {
  @IsEnum(EquipmentTechnicalStateEnum)
  technicalResult: NonCalibrationResult;

  @IsString()
  @IsOptional()
  observations?: string;

  // Obligatorio cuando el resultado es BLOCKED
  @ValidateIf((o) => o.technicalResult === EquipmentTechnicalStateEnum.BLOCKED)
  @IsEnum(BlockTypeEnum, { message: "El tipo de freno es obligatorio" })
  blockType?: BlockTypeEnum;

  // Obligatorio cuando blockType === NEEDS_PART
  @ValidateIf((o) => o.blockType === BlockTypeEnum.NEEDS_PART)
  @IsString()
  @IsNotEmpty({ message: "Indicá qué repuesto se necesita" })
  blockReason?: string;
}

import { IsEnum, IsOptional, IsString } from "class-validator";
import { EquipmentTechnicalStateEnum } from "../const.enum";

// Estados técnicos posibles desde el laboratorio (sin calibración completa)
const NON_CALIBRATION_RESULTS = [
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
}

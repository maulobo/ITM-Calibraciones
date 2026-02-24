import { IsEnum, IsOptional } from "class-validator";
import { ServiceOrderState } from "../schemas/service-order.schema";

export class UpdateServiceOrderDto {
  @IsEnum(ServiceOrderState)
  @IsOptional()
  generalStatus?: ServiceOrderState;
}

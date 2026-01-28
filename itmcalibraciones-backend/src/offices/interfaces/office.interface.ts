import { OfficeEntity } from "../schemas/office.schema";

export interface IOffice extends OfficeEntity {
  createdAt: Date;
  updatedAt: Date;
}

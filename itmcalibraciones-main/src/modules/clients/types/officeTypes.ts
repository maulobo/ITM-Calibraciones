import { z } from "zod";

export const officeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre de la oficina es obligatorio"),
  client: z.string().min(1, "El cliente es obligatorio"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  responsable: z.string().optional(),
  phoneNumber: z.string().optional(),
  adress: z.string().optional(),
});

export type CreateOrUpdateOfficeDTO = z.infer<typeof officeSchema>;

export interface Office {
  id: string;
  _id?: string;
  name: string;
  client: string | {
    _id: string;
    id?: string;
    socialReason: string;
    cuit: string;
    email?: string;
    responsable?: string;
    phoneNumber?: string;
    adress?: string;
  };
  city: string;
  cityName?: string;
  stateName?: string;
  responsable?: string;
  phoneNumber?: string;
  adress?: string;
  // Datos populated del backend
  cityData?: {
    _id: string;
    name: string;
    state: string;
  };
  stateData?: {
    _id: string;
    nombre: string;
  };
}

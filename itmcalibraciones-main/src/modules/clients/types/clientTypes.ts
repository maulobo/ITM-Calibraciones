import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  phone: z.string().optional(),
  role: z.string().optional(),
});

export const clientSchema = z.object({
  id: z.string().optional(),
  socialReason: z.string().min(1, "La Razón Social es obligatoria"),
  cuit: z.string().min(1, "El CUIT es obligatorio"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  responsable: z.string().optional(),
  phoneNumber: z.string().optional(),
  adress: z.string().optional(),
  city: z.string().min(1, "La ciudad es obligatoria"),
  cityName: z.string().optional(),
  state: z.string().optional(),
  stateName: z.string().optional(),
  contacts: z.array(contactSchema).optional().default([]),
});

export type ContactDTO = z.infer<typeof contactSchema>;
export type CreateOrUpdateClientDTO = z.infer<typeof clientSchema>;

export interface Client {
  id: string;
  _id?: string;
  socialReason: string;
  cuit: string;
  email?: string;
  responsable?: string;
  phoneNumber?: string;
  adress?: string;
  city?: string;
  cityName?: string;
  state?: string;
  stateName?: string;
  contacts?: ContactDTO[];
  // Campos populated del backend
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

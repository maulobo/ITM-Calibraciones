import { z } from "zod";
import { UserRoles } from "../../auth/types/authTypes";

export const technicianSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  office: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type CreateOrUpdateTechnicianDTO = z.infer<typeof technicianSchema>;

export interface Technician {
  id: string;
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  office?: string;
  phoneNumber?: string;
  roles: UserRoles[];
}

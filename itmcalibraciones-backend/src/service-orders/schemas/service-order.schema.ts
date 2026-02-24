import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

// Definimos los estados generales de la ORDEN (no del equipo individual)
export enum ServiceOrderState {
  PENDING = "PENDING",       // Recién creada
  IN_PROCESS = "IN_PROCESS", // Hay equipos trabajándose
  FINISHED = "FINISHED",     // Todos los equipos listos (técnicamente)
  DELIVERED = "DELIVERED",   // Entregada físicamente al cliente
  CANCELLED = "CANCELLED",   // Anulada
}

// Transiciones válidas: solo se puede avanzar, no retroceder
export const VALID_TRANSITIONS: Record<ServiceOrderState, ServiceOrderState[]> = {
  [ServiceOrderState.PENDING]:    [ServiceOrderState.IN_PROCESS, ServiceOrderState.CANCELLED],
  [ServiceOrderState.IN_PROCESS]: [ServiceOrderState.FINISHED,  ServiceOrderState.CANCELLED],
  [ServiceOrderState.FINISHED]:   [ServiceOrderState.DELIVERED,  ServiceOrderState.CANCELLED],
  [ServiceOrderState.DELIVERED]:  [],
  [ServiceOrderState.CANCELLED]:  [],
};

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class ServiceOrderEntity extends Document {
  // 1. Identificador Humano (Ej: "OT-26-0001")
  @Prop({ required: true, unique: true, index: true })
  code: string;

  // 2. Vinculación con Cliente (Usamos ObjectId para populate)
  @Prop({ type: Types.ObjectId, ref: "Client", required: true })
  client: Types.ObjectId;

  // 3. Vinculación con Sucursal (REQUERIDO)
  // De dónde vienen físicamente los equipos
  @Prop({ type: Types.ObjectId, ref: "Office", required: true })
  office: Types.ObjectId;

  // 4. Contactos SNAPSHOT (Array - múltiples personas que traen los equipos)
  // Esto es vital: Si borras al contacto del cliente, la orden histórica no se rompe.
  @Prop({
    type: [
      {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        role: { type: String },
        area: { type: String },
      },
    ],
    _id: false,
    default: [],
  })
  contacts: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    area?: string;
  }[];

  // 5. Fecha de Ingreso (Puede ser distinta al createdAt si cargan cosas viejas)
  @Prop({ default: Date.now })
  entryDate: Date;

  // 6. Fecha Prometida / Estimada (Para el dashboard)
  @Prop()
  estimatedDeliveryDate?: Date;

  // 7. Estado General
  @Prop({ enum: ServiceOrderState, default: ServiceOrderState.PENDING })
  generalStatus: ServiceOrderState;

  // 8. Observaciones generales del lote (Ej: "Trajeron todo en una caja roja")
  @Prop()
  observations?: string;

  // OPCIONAL: Array de IDs de equipos para acceso rápido desde la Orden
  // Aunque la relación real está en el Equipo, esto ayuda al frontend.
  @Prop({ type: [{ type: Types.ObjectId, ref: "Equipment" }], default: [] })
  equipments: Types.ObjectId[];

  // Historial de cambios de estado (trazabilidad)
  @Prop({
    type: [
      {
        from:          { type: String },
        to:            { type: String, required: true },
        changedById:   { type: Types.ObjectId },
        changedByName: { type: String },
        changedAt:     { type: Date, default: Date.now },
        note:          { type: String },
      },
    ],
    _id: false,
    default: [],
  })
  statusHistory: {
    from?: string;
    to: string;
    changedById?: Types.ObjectId;
    changedByName?: string;
    changedAt: Date;
    note?: string;
  }[];
}

export const ServiceOrderSchema =
  SchemaFactory.createForClass(ServiceOrderEntity);

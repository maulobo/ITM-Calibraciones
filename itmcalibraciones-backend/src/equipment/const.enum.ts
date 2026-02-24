export enum EquipmentTechnicalStateEnum {
    PENDING = 'PENDING',                               // A calibrar / A reparar (recién ingresó)
    IN_PROCESS = 'IN_PROCESS',                         // En proceso (técnico lo está trabajando)
    CALIBRATED = 'CALIBRATED',                         // Calibrado (con certificado)
    VERIFIED = 'VERIFIED',                             // Verificado (funcional, sin certificado)
    MAINTENANCE = 'MAINTENANCE',                       // Mantenimiento/Reparación realizado
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',                 // Fuera de servicio (dado de baja)
    RETURN_WITHOUT_CALIBRATION = 'RETURN_WITHOUT_CALIBRATION', // Devolución sin calibrar
}

export enum EquipmentLogisticStateEnum {
    RECEIVED = 'RECEIVED',                   // Ingresado en ITM
    IN_LABORATORY = 'IN_LABORATORY',         // En laboratorio
    EXTERNAL = 'EXTERNAL',                   // En proveedor externo
    ON_HOLD = 'ON_HOLD',                     // En espera (papeles, autorización, piezas)
    READY_TO_DELIVER = 'READY_TO_DELIVER',   // Listo para retiro
    DELIVERED = 'DELIVERED',                 // Entregado al cliente
}

export enum PurchaseOrderRequirementEnum {
    YES = 'YES',
    NO = 'NO',
    NOT_REQUIRED = 'NOT_REQUIRED'
}

// Legacy — conservado para compatibilidad con equipment-state-log
export enum EquipmentStateEnum {
    CALIBRATED = 'CALIBRATED',
    EXPIRED = 'EXPIRED',
    IN_PROCESS = 'IN_PROCESS',
    CREATED = 'CREATED',
    SENDED = "SENDED",
}

// EquipmentLocationEnum is deprecated — location is now captured by logisticState (EXTERNAL)
export enum EquipmentLocationEnum {
    ITM = 'ITM',
    EXTERNAL = 'EXTERNAL'
}

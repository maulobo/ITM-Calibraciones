export enum EquipmentTechnicalStateEnum {
    TO_CALIBRATE = 'TO_CALIBRATE',          // Para calibrar
    TO_REPAIR = 'TO_REPAIR',                // A Reparar
    CALIBRATED = 'CALIBRATED',              // Calibrado
    VERIFIED = 'VERIFIED',                  // Verificado
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',      // Fuera de Servicio
    RETURN_WITHOUT_CALIBRATION = 'RETURN_WITHOUT_CALIBRATION' // Devolución sin calibrar
}

export enum EquipmentLogisticStateEnum {
    RECEIVED = 'RECEIVED',             // Ingreso
    IN_LABORATORY = 'IN_LABORATORY',   // En Laboratorio
    READY_TO_DELIVER = 'READY_TO_DELIVER', // Listo para retirar
    DELIVERED = 'DELIVERED',           // Retirado
    ON_HOLD = 'ON_HOLD'                // Frenado (Espera)
}

export enum PurchaseOrderRequirementEnum {
    YES = 'YES',
    NO = 'NO',
    NOT_REQUIRED = 'NOT_REQUIRED'
}

export enum EquipmentLocationEnum {
    ITM = 'ITM',
    EXTERNAL = 'EXTERNAL'
}

export enum EquipmentStateEnum {
    CALIBRATED = 'CALIBRATED', // Calibrated
    EXPIRED = 'EXPIRED', // Calibrated or maintence expired
    IN_PROCESS = 'IN_PROCESS', // In process of repair or calibrating
    CREATED = 'CREATED', // Created (empty)
    SENDED = "SENDED", // Sended
}
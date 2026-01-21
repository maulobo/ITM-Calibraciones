export enum EquipmentStateEnum {
    CALIBRATED = 'Calibrado',
    SOON_EXPIRED = 'Pronto a vencer',
    EXPIRED = 'Vencido',
    IN_PROCESS = 'Enviado a calibrar',
    OUT_OF_SERFVICE = 'Fuera de servicio'
}

export const EquipmentStateColorSchema = {
  [EquipmentStateEnum.SOON_EXPIRED]: "yellow",
  [EquipmentStateEnum.EXPIRED]: "red",
  [EquipmentStateEnum.CALIBRATED]: "whatsapp",
  [EquipmentStateEnum.IN_PROCESS]: "blue",
  [EquipmentStateEnum.OUT_OF_SERFVICE]: "red",
}

export const EquipmentStateColor = {
  [EquipmentStateEnum.SOON_EXPIRED]: "#FFC857",
  [EquipmentStateEnum.EXPIRED]: "#D7263D",
  [EquipmentStateEnum.CALIBRATED]: "#0D4F0F",
  [EquipmentStateEnum.IN_PROCESS]: "#326699",
  [EquipmentStateEnum.OUT_OF_SERFVICE]: "red",
}
import { EquipmentStateColorSchema, EquipmentStateEnum } from '@/const/equipmentState.const';
import { Badge } from '@chakra-ui/react';


export default function InstrumentBadge({ state }:{state: EquipmentStateEnum}) {
    return (
        <Badge ml='1' colorScheme={ EquipmentStateColorSchema[state] }>
            { state }
        </Badge>
    )
}

export function getTypeInstrumentBadge(expirationDate:string | undefined){
    const instrumentState = getInstrumentState(expirationDate)
    return InstrumentBadge({state: instrumentState})    
}

export function getInstrumentState(expirationDate:string | undefined):EquipmentStateEnum{
    const today = new Date();
    if(!expirationDate) return EquipmentStateEnum.IN_PROCESS
    const expiration = new Date(expirationDate);
    const differenceInTime = expiration.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    if(differenceInDays <= 0 ) return EquipmentStateEnum.EXPIRED
    if(differenceInDays > 0 &&  differenceInDays <= 30) return EquipmentStateEnum.SOON_EXPIRED
    if(differenceInDays > 30) return EquipmentStateEnum.CALIBRATED

    
    return EquipmentStateEnum.IN_PROCESS

}
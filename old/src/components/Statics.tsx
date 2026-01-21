import { IInstrument } from '@/api/types/instrument.type'
import { EquipmentStateColor, EquipmentStateEnum } from '@/const/equipmentState.const'
import { Box, Flex, FormControl, FormLabel, Grid, GridItem, Switch, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Pie, PieChart } from 'recharts'
import { getInstrumentState } from './instrumentBadge'

type Props = {
    instruments:IInstrument[]
}

type StateCount = {
    [state in EquipmentStateEnum]?: number;
}

type InstrumentStatus = {
    name: EquipmentStateEnum,
    value: number | undefined,
    fill: string,
}

const RADIAN = Math.PI / 180;

const Statics = (props: Props) => {
    const { instruments }  = props
    const [ instrumentsStatus, setInstrumentsStatus] = useState<InstrumentStatus[]>([])
    const [ percentage, setPercentage] = useState<boolean>(true)
    
    const handleToggle = () => {
        setPercentage(!percentage)
    };

    useEffect(()=>{
        
        const stateCounts: StateCount = instruments.filter( i => !i.outOfService ).reduce<StateCount>((acc, curr) => {
            const state = getInstrumentState(curr.calibrationExpirationDate)
            if (!acc[state]) {
              acc[state] = 0; // si el estado no está en el acumulador, lo inicializamos
            }
            acc[state]! += 1; // incrementamos el contador para el estado
            return acc;
          }, {});

          const counts = [
            { name: EquipmentStateEnum.SOON_EXPIRED, value: stateCounts[EquipmentStateEnum.SOON_EXPIRED] ?? 0, fill: EquipmentStateColor[EquipmentStateEnum.SOON_EXPIRED] },
            { name: EquipmentStateEnum.CALIBRATED, value: stateCounts[EquipmentStateEnum.CALIBRATED] ?? 0, fill: EquipmentStateColor[EquipmentStateEnum.CALIBRATED] },
            { name: EquipmentStateEnum.IN_PROCESS, value: stateCounts[EquipmentStateEnum.IN_PROCESS] ?? 0, fill: EquipmentStateColor[EquipmentStateEnum.IN_PROCESS] },
            { name: EquipmentStateEnum.EXPIRED, value: stateCounts[EquipmentStateEnum.EXPIRED] ?? 0, fill: EquipmentStateColor[EquipmentStateEnum.EXPIRED] },
          ].sort((a, b) => b.value - a.value)
          
          setInstrumentsStatus(counts);
    },[instruments])

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, fill, value, index, ...other }: any) => {
    
        const radius = 25 + innerRadius + (outerRadius - innerRadius);
        const x = (cx - 10) + radius * Math.cos(-midAngle * RADIAN);
        const y = (cy - 5) + radius * Math.sin(-midAngle * RADIAN);
    
        return (
            <text
              x={x}
              y={y}
              fill={fill}
              key = {index}
            >
                { percentage ? `${(percent * 100).toFixed(0)}% ` : value}
            </text>
        );
    };
    
  return (
    <Grid templateColumns='1' margin={"auto"}>
        <GridItem>
        <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="toggle-button" mb="0">
                Porcentaje
            </FormLabel>
            <Switch id="toggle-button" colorScheme="teal" isChecked={percentage} onChange={handleToggle} />
            </FormControl>

            <Box>
                <PieChart width={350} height={180} className='m-auto'>
                    <Pie
                    key="instrumentsStatus"
                    className='m-auto'
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    data={instrumentsStatus}
                    cx="50%"
                    cy="150"
                    outerRadius={100}
                    label={renderCustomizedLabel}
                    />
                    {/* <Legend wrapperStyle={{fontSize: "15px"}}/> */}
                </PieChart>
            </Box>
        </GridItem>            
        <GridItem>
            <Box>
            <Flex flexFlow={"row"} gap={5} justifyContent={"center"} alignContent={"center"}>    
                    { instrumentsStatus.map((i: InstrumentStatus) => {
                        return (
                            <Box key={i.name} position="relative" display="inline-flex" alignItems="center">
                                <Box
                                    position="absolute"
                                    width={4}
                                    height={4}
                                    bg={EquipmentStateColor[i.name]}
                                    borderRadius="full"
                                />
                                <Text color={EquipmentStateColor[i.name]} marginLeft={5}>
                                    {i.name}: {i.value}
                                </Text>
                            </Box>
                        )
                    }) }
                </Flex>
            </Box>
                    
                
            
        </GridItem>

    </Grid>
    
  )
}

export default Statics
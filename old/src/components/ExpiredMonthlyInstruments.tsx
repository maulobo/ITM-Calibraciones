import { IInstrument } from '@/api/types/instrument.type'
import { Box, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

type Props = {
  instruments: IInstrument[]
  setExpirationDateFilter: React.Dispatch<React.SetStateAction<number | string>>
}

type InstrumentGroups = {
  [key: string]: IInstrument[]
}

const ExpiredMonthlyInstruments = (props: Props) => {
  const { instruments, setExpirationDateFilter } = props
  const [instrumentGroup, setInstrumentGroup] = useState<InstrumentGroups>()
  
  const outOfServiceCount = instruments.filter(i => i.outOfService).length;

  useMemo(() => {
    const currentDate = new Date()
    const groupedInstruments = instruments.filter( i => !i.outOfService  ).reduce((groups: InstrumentGroups, instrument: IInstrument) => {

      const expirationDate = new Date(instrument.calibrationExpirationDate)
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24))

      let groupKey: string
      
      if (daysUntilExpiration <= 30) {
        groupKey = '30'
      } else if (daysUntilExpiration < 60) {
        groupKey = '60'
      } else if (daysUntilExpiration < 90) {
        groupKey = '90'
      } else {
        groupKey = '91'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }

      groups[groupKey].push(instrument)
      
      return groups
    }, {})

    setInstrumentGroup(groupedInstruments)
  }, [instruments])

  return (
    <VStack spacing={3} align='stretch'>
      <Box h='30px'>
            <Box>
              Total de instrumentos: {' '}
              <span> {instruments.length} </span>
              <span> {outOfServiceCount > 0 ? `(${outOfServiceCount} fuera de servicio) `:''} </span>
            </Box>

      </Box>
      <h1 style={{fontWeight:"bold"}}>Instrumentos próximos a vencer:</h1>
      {instrumentGroup && (
        <>
          <Box h='30px'>
            <Box>
              En 30 días o menos: {' '}
              <span onClick={()=>{setExpirationDateFilter(30)}} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#d7253d' }}>
                {instrumentGroup['30']?.length || 0} instrumentos
              </span>
            </Box>
          </Box>
          <Box h='30px'>
            <Box>
              Entre 30 y 60 días: {' '}
              <span onClick={()=>{setExpirationDateFilter(60)}} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ffc858' }}>
                {instrumentGroup['60']?.length || 0} instrumentos
              </span>
            </Box>
          </Box>
          <Box h='30px'>
            <Box>
              Entre 60 y 90 días: {' '}
              <span onClick={()=>{setExpirationDateFilter(90)}} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#326699' }}>
                {instrumentGroup['90']?.length || 0} instrumentos
              </span>
            </Box>
          </Box>
          <Box h='30px'>
            <Box>
              En 90 días o más: {' '}
              <span onClick={()=>{setExpirationDateFilter(91)}} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#0b4f10' }}>
                {instrumentGroup['91']?.length || 0} instrumentos
              </span>
            </Box>
          </Box>
          
        </>
      )}
    </VStack>
  )
}

export default ExpiredMonthlyInstruments

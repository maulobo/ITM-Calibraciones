import { IBrand } from '@/api/types/brands.type'
import { IInstrument } from '@/api/types/instrument.type'
import { IINstrumentType } from '@/api/types/intruments-type.type'
import { IModel } from '@/api/types/models.type'
import { Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'

function TableInstrumentRelated({instruments}:{instruments:IInstrument[]}) {
  return (
    <TableContainer>
        <br></br>
        <hr/>
        <br></br>
    <Text fontSize='md  ' fontWeight={"bold"}>Equipos relacionados con el presupuesto: </Text>
    <br></br>
  <Table variant='striped' size={"sm"} colorScheme='gray'>
    <Thead>
      <Tr>
        <Th>N/S</Th>
        <Th>Tipo de Equipo</Th>
        <Th>Marca</Th>
        <Th>Modelo</Th>
      </Tr>
    </Thead>
    <Tbody>
        {
            instruments.map((i, index)=>{
                return <Tr key={i.id + "_" +index}>
                <Td>{i.serialNumber}</Td>
                <Td>{(i.instrumentType as any as IINstrumentType).type}</Td>
                <Td>{((i.model as any as IModel).brand as any as IBrand).name}</Td>
                <Td>{(i.model as any as IModel).name}</Td>
              </Tr>
            })
        }
      
    </Tbody>
  </Table>
  <br></br>
        <hr/>
        <br></br>
</TableContainer>
  )
}

export default TableInstrumentRelated
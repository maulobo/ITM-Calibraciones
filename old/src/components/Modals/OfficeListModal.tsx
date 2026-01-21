import { GetOfficeByClientQuery } from '@/api/query/office.query'
import { IOffice } from '@/api/types/office.type'
import { AddIcon, EditIcon } from '@chakra-ui/icons'
import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ITMButton from '../Button'
import CreateOrUpdateOfficeModal from './CreateOrUpdateOfficeModal'

type props = {
  client: string
  isModalOpen?: boolean
  setIsModalOpen?: any
}

function OfficeListModal(props:props) {
    const { client, isModalOpen, setIsModalOpen } = props
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ isOfficeModalOpen, setIsOfficeModalOpen ] = useState<boolean>(false)
    const [ officeToEdit, setOfficeToEdit ] = useState<IOffice>()

    const handleEditOffice = ({office}:{office:IOffice}) => {
      setOfficeToEdit(office)
      setIsOfficeModalOpen(true)
    }

    useEffect(()=>{
        client && refetchGetOfficeByClientQuery()
    },[client])

    const { 
        data: officeList, 
        refetch: refetchGetOfficeByClientQuery 
      } = GetOfficeByClientQuery({options: {enabled: false}, client })

    const handleCloseModal = () => {
        if(setIsModalOpen) setIsModalOpen(false);
        onClose()
      };

    useEffect(()=>{
        if(isModalOpen){
          onOpen()
        }
      },[isModalOpen])

      const handleAddOffice = () => {
        setOfficeToEdit(undefined)
        setIsOfficeModalOpen(true)
    }
    
    return (
      <>
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal}>
          <ModalOverlay />
          <ModalContent minWidth="fit-content">
            <ModalHeader>
                Sucursales

                <ITMButton
                    template="light"
                    onClick={handleAddOffice}
                    marginLeft={5}
                  >
                    <AddIcon/>
                  </ITMButton>
                  
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <TableContainer>
                <Table variant='ghost'>
                    <Thead>
                    <Tr>
                        <Th>Ciudad</Th>
                        <Th>Nombre sucursal</Th>
                        <Th>Responsable</Th>
                        <Th>Teléfono</Th>
                        <Th>Dirección</Th>
                        <Th>Editar</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                    { 
                        officeList?.map( (office ) => {
                            return  <Tr>
                                <Td>{ office.city.name }</Td>
                                <Td>{ office.name }</Td>
                                <Td>{ office.responsable }</Td>
                                <Td>{ office.phoneNumber }</Td>
                                <Td>{ office.adress }</Td>
                                <Td>
                                < Flex justifyContent="space-between">
                                  <ITMButton
                                    template="light"
                                    onClick={() => handleEditOffice({office})}
                                  >
                                    <EditIcon/>
                                  </ITMButton>
                                </Flex>
                                </Td>
                            </Tr>
                        })
                    }
                        
                    </Tbody>
                </Table>
                </TableContainer>

                
              
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='red' mr={3} onClick={handleCloseModal}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        { <CreateOrUpdateOfficeModal
            isModalOpen={isOfficeModalOpen}
            setIsModalOpen={setIsOfficeModalOpen}
            client={client}
            office={officeToEdit}
            refetch={refetchGetOfficeByClientQuery}
        /> }
        
      </>
    )
}

export default OfficeListModal

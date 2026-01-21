import { IOffice } from '@/api/types/office.type'
import { AddIcon } from '@chakra-ui/icons'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import ITMButton from '../Button'
import FormCreateOrUpdateOfficeForm from '../Forms/CreateOrUpdateOfficeForm'

type  props = {
  office?: IOffice,
  isModalOpen?: boolean
  setIsModalOpen?: any
  setEdit?: any,
  client: string,
  refetch?: () => void
}

function CreateOrUpdateOfficeModal(props: props) {
    const { office, isModalOpen, setIsModalOpen, setEdit, client, refetch } = props
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const handleCloseModal = () => {
      if(setIsModalOpen) setIsModalOpen(false);
      setEdit && setEdit()
      onClose()
    };

    useEffect(()=>{
      if(isModalOpen){
        onOpen()
      }
    },[isModalOpen])
    
    return (
      <>
        <ITMButton template="light" onClick={onOpen}>
            <AddIcon marginRight={3} />
            { !office ? "Sucursal" : "Editar"}
        </ITMButton>
  
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ !office ? "Crear sucursal" : "Actualizar sucursal"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormCreateOrUpdateOfficeForm refetch={refetch} key={office?.id} client={client} office={office} onClose={onClose}/>
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='red' mr={3} onClick={handleCloseModal}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}

export default CreateOrUpdateOfficeModal

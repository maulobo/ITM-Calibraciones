import { IClient } from '@/api/types/client.type'
import { AddIcon } from '@chakra-ui/icons'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import ITMButton from '../Button'
import FormCreateOrUpdateCostumerForm from '../Forms/CreateOrUpdateCostumerForm'

type  CostumerModalProps = {
  costumer?: IClient,
  isModalOpen?: boolean
  setIsModalOpen?: any
  setEditCostumer?: any
}

function CreateOrUpdateCostumerModal(props: CostumerModalProps) {
    const { costumer, isModalOpen, setIsModalOpen, setEditCostumer } = props
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const handleCloseModal = () => {
      if(setIsModalOpen) setIsModalOpen(false);
      setEditCostumer && setEditCostumer()
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
            { !costumer ? "Cliente" : "Editar"}
        </ITMButton>
  
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ !costumer ? "Crear cliente" : "Actualizar cliente"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormCreateOrUpdateCostumerForm key={costumer?.id} costumer={costumer} onClose={onClose}/>
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

export default CreateOrUpdateCostumerModal

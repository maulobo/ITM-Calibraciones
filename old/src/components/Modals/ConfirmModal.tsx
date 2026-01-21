import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'

type Props = {
  isModalOpen?: boolean
  setIsModalOpen?: any
  confirmCallbackModal: (any:any) => void
  title: string
  body: ReactNode
}

function ConfirmModal(props:Props) {
    const { confirmCallbackModal, title, body, isModalOpen, setIsModalOpen } = props
    const { isOpen, onOpen, onClose } = useDisclosure()
 
    const handleCloseModal = () => {
      if(setIsModalOpen) setIsModalOpen(false);
      onClose()
    };

    useEffect(()=>{
      if(isModalOpen){
        isModalOpen && onOpen()
      }else{
        onClose()
      }
    },[isModalOpen])
    
    return (
      <>
    
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ title }</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                { body }
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={handleCloseModal}>
                Cerrar
              </Button>
              <Button colorScheme='red' mr={3} onClick={confirmCallbackModal}>
                Confirmar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}

export default ConfirmModal

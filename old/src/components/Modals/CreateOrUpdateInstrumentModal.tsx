import { IInstrument } from '@/api/types/instrument.type'
import { AddIcon, EditIcon } from '@chakra-ui/icons'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import ITMButton from '../Button'
import FormCreateOrUpdateInstrument from '../Forms/CreateOrUpdateInstrument'

type  props = {
  instrument?: IInstrument,
  isModalOpen?: boolean
  setIsModalOpen?: any
  setEdit?: any,
  refetch?: () => void
}

function CreateOrUpdateInstrumentModal(props: props) {
    const { instrument, isModalOpen, setIsModalOpen, setEdit, refetch } = props
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
            { !instrument ? <><AddIcon marginRight={3} />Nuevo Instrumento</> : <> <EditIcon marginRight={3} />Editar Instrumento</>}
        </ITMButton>
  
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ !instrument ? "Crear instrumento" : "Actualizar instrumento"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormCreateOrUpdateInstrument refetch={refetch} instrument={instrument} />
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

export default CreateOrUpdateInstrumentModal

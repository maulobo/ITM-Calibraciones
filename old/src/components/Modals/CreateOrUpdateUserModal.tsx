import { IUser } from '@/api/types/user.types'
import { AddIcon } from '@chakra-ui/icons'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import ITMButton from '../Button'
import FormCreateOrUpdateUser from '../Forms/CreateOrUpdateUser'

type  UserModalProps = {
  user?: IUser,
  isModalOpen?: boolean
  setIsModalOpen?: any
  setEditUser?: any
}

function CreateOrUpdateUserModal(props: UserModalProps) {
    const { user, isModalOpen, setIsModalOpen, setEditUser } = props
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const handleCloseModal = () => {
      if(setIsModalOpen) setIsModalOpen(false);
      setEditUser && setEditUser()
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
            { !user ? "Usuario" : "Editar"}
        </ITMButton>
  
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ !user ? "Crear usuario" : "Actualizar usuario"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormCreateOrUpdateUser key={user?.id || user?.email} user={user} onClose={onClose}/>
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

export default CreateOrUpdateUserModal

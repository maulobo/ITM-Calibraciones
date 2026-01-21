import { IInstrument } from '@/api/types/instrument.type'
import { ITechnicalInform } from '@/api/types/technical-inform.types'
import { UserRolesEnum } from '@/const/userRoles.const'
import { useUserRole } from '@/hooks/userRoleHook'
import { AddIcon, EditIcon } from '@chakra-ui/icons'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import ITMButton from '../Button'
import CreateOrUpdateTechnicalInform from '../Forms/CreateOrUpdateTechnicalInform'

type TechnicalInformModalProps = {
  instrument: IInstrument
  technicalInform?: ITechnicalInform
  edit?: boolean
}

function TechnicalInformModal(props:TechnicalInformModalProps) {
    const { instrument, technicalInform, edit } = props
    const { isOpen, onOpen, onClose } = useDisclosure()
    const userRole = useUserRole()
    const canEdit = userRole && [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL].includes(userRole)

    const showAddTechnicalInform = () => {
      if(canEdit)
      return <ITMButton template="light" onClick={onOpen}>
          <AddIcon marginRight={3} />
          Informe Tecnico
      </ITMButton>
    }

    const showEditTechnicalInform = () => {
      if(canEdit && edit)
      return <ITMButton template="light" marginRight={2} onClick={onOpen} float={'right'} marginTop={5} maxW={"min-content"}>
        <EditIcon/> 
    </ITMButton>
    }

    return (
      <>
        { !edit && showAddTechnicalInform() }
        
  
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={onClose} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Crear nuevo informe técnico</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <CreateOrUpdateTechnicalInform technicalInform={technicalInform} instrument={ instrument } onClose={onClose}/>
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='red' mr={3} onClick={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        { edit && showEditTechnicalInform() }
      </>
    )
}

export default TechnicalInformModal

import { IBrand } from '@/api/types/brands.type'
import { ICertificate } from '@/api/types/certificate.types'
import { IInstrument } from '@/api/types/instrument.type'
import { IINstrumentType } from '@/api/types/intruments-type.type'
import { IModel } from '@/api/types/models.type'
import { Button, Center, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import FormCreateOrUpdateCertificate from '../Forms/CreateOrUpdateCertificate'

type Props = {
  certificate?: ICertificate
  instrument?: IInstrument
  isModalOpen?: boolean
  setIsModalOpen?: any
  setEditCertificate?: any
}

function CreateOrUpdateCertificateModal(props:Props) {
    const { certificate, instrument, isModalOpen, setIsModalOpen, setEditCertificate } = props
    const [instrumentCertificate, setInstrumentCertificate ] = useState<ICertificate>()
    const { isOpen, onOpen, onClose } = useDisclosure()
 
    const handleCloseModal = () => {
      if(setIsModalOpen) setIsModalOpen(false);
      setEditCertificate()
      onClose()
    };

    useEffect(()=>{
      if(certificate) setInstrumentCertificate(certificate)
      if(instrument?.certificate) setInstrumentCertificate(instrument.certificate as ICertificate)
    },[certificate, instrument])

    useEffect(()=>{
      if(isModalOpen){
        onOpen()
      }
    },[isModalOpen])
    
    return (
      <>
    
        <Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={handleCloseModal} size={"xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ certificate ? "Editar un certificado": "Crear nuevo certificado"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Flex>
              <Center>
                <HStack spacing='10px'>
                <Text color={"itm.1000"} fontWeight={"bold"}>{ (instrument?.instrumentType as IINstrumentType)?.type }</Text>
                <Text>n/s: {instrument?.serialNumber}</Text>
                <Text>Marca: { (instrument?.brand as IBrand)?.name }</Text>
                <Text>Modelo: { (instrument?.model as IModel)?.name }</Text>
                </HStack>
                
              </Center>
            </Flex>
              <FormCreateOrUpdateCertificate certificate={instrumentCertificate} instrument={instrument} onClose={onClose}/>
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

export default CreateOrUpdateCertificateModal

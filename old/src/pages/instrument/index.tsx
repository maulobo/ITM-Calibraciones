'use client'
import { GetCertificateQuery } from "@/api/query/certificate.query";
import { GetInstrumentQuery } from "@/api/query/instruments.query";
import { IInstrument } from "@/api/types/instrument.type";
import { IModel } from "@/api/types/models.type";
import { certificateDateFormat } from "@/commons/dateTimeFunctions";
import { DownloadCertificate } from "@/commons/dowloadCertificate";
import BackButton from "@/components/BackButton";
import ITMButton from "@/components/Button";
import ButtonDowloadTSticker from "@/components/ButtonDowloadSticker";
import CreateOrUpdateInstrumentModal from "@/components/Modals/CreateOrUpdateInstrumentModal";
import TechnicalInformModal from "@/components/Modals/TechnicalInformModal";
import SpinnerITM from "@/components/Spinner";
import TechnicalInform from "@/components/TechnicalInform";
import Title from "@/components/Title";
import InstrumentBadge, { getTypeInstrumentBadge } from "@/components/instrumentBadge";
import { EquipmentStateEnum } from "@/const/equipmentState.const";
import { UserRolesEnum } from "@/const/userRoles.const";
import { useUserRole } from "@/hooks/userRoleHook";
import { ArrowDownIcon } from '@chakra-ui/icons';
import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Select, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";

export interface Params{
    [key: string]: any
  }

export default function InstrumentPage() {
    const router = useRouter();
    const { query } = router;
    const [ instrument, setInstrument ] = useState<IInstrument>()
    const [ params, setParams ] = useState<Params>({})
    const [ paramsCertificate, setParamsCertificate ] = useState<Params>({})
    const userRole = useUserRole()
    const canDownload = userRole && [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL].includes(userRole)
    const canEdit = userRole && [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL].includes(userRole)
    const { refetch, data: instrumentData, isLoading } = GetInstrumentQuery({ 
        enabled: false,
        options: { enabled: false },
        params
    })
    const { data: allCertificates, refetch: RefetchGetCertificateQuery } = GetCertificateQuery({
        enabled: false,
        params: paramsCertificate
    })
    
    useEffect(()=>{
        const newParams: Record<string, any> = {};

        for (const key in query) {
            if (query[key]) {
                newParams[key] = query[key];
            }
        }
        newParams["populate"] = ["office", "model.brand", "instrumentType"]
        const send = Object.keys(query).length > 0
        if(send){
            setParams(newParams)
        }
    }, [ query ])

    useEffect(()=>{
        if(Object.keys(params).length > 0) refetch()
    },[params])

    useEffect(()=>{
        if(Object.keys(paramsCertificate).length > 0) RefetchGetCertificateQuery()
    },[paramsCertificate])

    useEffect(()=>{
        if(instrumentData && instrumentData[0]){
            setInstrument(instrumentData[0])
            setParamsCertificate({
                equipment: instrumentData[0].id
            })
        }
    },[instrumentData])

    const handleDownloadClick = () => {
        if (instrument?.qr) {
          downloadImage(instrument.qr, `${instrument.serialNumber}.png`);
        }
    };

    const downloadImage = (base64Image: string, filename: string) => {
        const link = document.createElement('a');
        link.href = base64Image;
        link.download = filename;
        link.click();
    }

    const handleDowloadCertificate = ({certificate}:{certificate:string}) => {
        certificate && DownloadCertificate({certificate})
    }

    return (
        <Box padding='1'>
            <Flex 
                flexDirection={"row"} 
                gap={5} 
                align={"left"}
                justifyContent={"center"}
                verticalAlign={"center"}
                key={"title"}
            >
                <BackButton/>
                <Title title="Ficha de Instrumento"/>
            </Flex>
            
            <Flex flexDirection={"row"} gap={5} align={"center"} key={"NS"}>
                
                {/* <SerialNumberInputList onChange={ setParams }/> */}
                
                { instrument && <TechnicalInformModal instrument={instrument} />}

                { canDownload && instrument?.calibrationExpirationDate && <ButtonDowloadTSticker instrument={instrument}/>}

                { instrument && canEdit && <CreateOrUpdateInstrumentModal instrument={instrument} />}
            </Flex>

            { instrument &&  <Card marginTop={10}>
                <CardHeader>

                    <Heading 
                        size='s'>
                            { (instrument?.instrumentType as any)?.type} </Heading>
                    <Heading 
                        size='md'>
                            N/S: {instrument?.serialNumber} 
                            {instrument?.customSerialNumber && ` (${instrument?.customSerialNumber})` } 
                    </Heading>
                     
                        <div className="max-w-QR absolute top-1 right-2">
                            <img
                                src={instrument?.qr}
                                alt="QR Equipment"
                                placeholder="blur"
                                />
                            { canDownload &&
                                <Button colorScheme="green" size="xs" float="right" left="-20px" onClick={handleDownloadClick}>
                                    <ArrowDownIcon marginRight={1}/> QR
                                </Button>
                            }
                        </div>
                        
                    
                </CardHeader>

                <CardBody>
                    <Stack spacing='5'>
                    <Box>
                        <SimpleGrid columns={{ sm: 1, md: 2 }} spacing="5px">
                                {instrument?.label && <Box>Etiqueta: {instrument?.label} </Box> }
                                <Box>Marca: {(instrument?.model as IModel)?.brand?.name} </Box>
                                <Box>Modelo: {(instrument?.model as any)?.name} </Box>
                                <Box>Rango: {instrument?.range} </Box>
                                <Box>Descripción: {instrument?.description || " - "} </Box>
                                <Box>Estado: 
                                    { 
                                        instrument?.outOfService ? InstrumentBadge({state:EquipmentStateEnum.OUT_OF_SERFVICE}) : getTypeInstrumentBadge(instrument?.calibrationExpirationDate) 
                                    }
                                </Box>
                            
                        </SimpleGrid>
                    </Box>
                    <Box>
                        { !instrument?.certificate && <Text>Todavía no hay certificados</Text>    }
                        
                        { instrument?.certificate && <ITMButton template="dark" marginRight={5} onClick={()=>{handleDowloadCertificate({certificate:instrument.certificate as string})}}>
                        <AiOutlineCloudDownload style={{marginRight:5}}/> Certificado vigente </ITMButton>
                        }
                        
                        { instrument?.certificate && <Select placeholder='Descargar certificdos anteriores' onChange={(e) => handleDowloadCertificate({certificate: e.target.value})} maxWidth={"max-content"} float={"right"}>
                            { allCertificates?.map((cer) => {
                                return <option key={cer.id} value={cer.certificate as string}>
                                Certificado {cer.number} del {certificateDateFormat(cer.calibrationDate)} al {certificateDateFormat(cer.calibrationExpirationDate)}
                                </option>
                            } )}
                            </Select>
                        }
                             
                    </Box>
                    
                    </Stack>
                </CardBody>
                </Card>
            }
            {
                !instrument && 
                <Card marginTop={10}>
                <CardHeader>
                    <Heading textAlign={"center"}>404</Heading>
                </CardHeader>

                <CardBody textAlign={"center"}>
                    <Text>Instrumento no encontrado</Text>
                </CardBody>
                </Card>
            }

                    { instrument && <TechnicalInform instrument={instrument}/> }
                    { isLoading && <SpinnerITM/>}
        </Box>
    )
}

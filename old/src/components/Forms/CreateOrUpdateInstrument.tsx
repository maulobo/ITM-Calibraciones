import { GetBrandsQuery } from "@/api/query/brands.query";
import { GetAllClientsQuery } from "@/api/query/client.query";
import { GetInstrumentsTypeQuery } from "@/api/query/instruments-type.query";
import { AddInstrumentQuery } from "@/api/query/instruments.query";
import { GetModelsQuery } from "@/api/query/model.query";
import { GetOfficeByClientQuery } from "@/api/query/office.query";
import { IBrand } from "@/api/types/brands.type";
import { IInstrument } from "@/api/types/instrument.type";
import { IINstrumentType } from "@/api/types/intruments-type.type";
import { IModel } from "@/api/types/models.type";
import { IOffice } from "@/api/types/office.type";
import { POP_OVER_CONTENT } from "@/const/popOver.const";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Card, CardBody, Checkbox, Flex, Input, Select, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import ITMButton from "../Button";
import SpinnerITM from "../Spinner";
import { ItmPopover } from "../popOver";
import FormCreateOrUpdateBrandForm from "./CreateOrUpdateBrandForm";
import FormCreateOrUpdateInstrumentTypeForm from "./CreateOrUpdateInstrumentType";
import FormCreateOrUpdateModelForm from "./CreateOrUpdateModelForm";
import FormCreateOrUpdateOfficeForm from "./CreateOrUpdateOfficeForm";

const InstrumentSchema = Yup.object().shape({
    instrumentType: Yup.string()
      .required('El tipo de instrumento es requerido'),
    serialNumber: Yup.string()
      .required('El numero de serie es requerido'),
    brand: Yup.string()
      .required('La marca es requerida'),
    model: Yup.string()
      .required('El modelo es requerido'),
    range: Yup.string(),
    client: Yup.string()
      .required('El cliente es requerido'),
    office: Yup.string()
      .required('La sucursal del cliente es requerido'),
    id: Yup.string(),
    description: Yup.string(),
    sendEmailNotification: Yup.boolean(),
    outOfService: Yup.boolean()
  });

type FormData = Yup.InferType<typeof InstrumentSchema>;

type Props = {
  refetch?: () => void;
  instrument?: IInstrument
};

const FormCreateOrUpdateInstrument = (props:Props) => {
  const { refetch, instrument } = props
  const [errorAddInstrument, setErrorAddInstrument] = useState("")
  const [createNewInstrumentType, setCreateNewInstrumentType] = useState<boolean>(false)
  const [createNewOffice, setCreateNewOffice] = useState<boolean>(false)
  const [createNewBrand, setCreateNewBrand] = useState<boolean>(false)
  const [createNewModel, setCreateNewModel] = useState<boolean>(false)
  const { data: allClients } = GetAllClientsQuery()
  const { data: brands, refetch: refetchBrands } = GetBrandsQuery()
  const { data: instrumentType, refetch: refetchInstrumentTypes } = GetInstrumentsTypeQuery()
  
  const {
    mutate: AddInstrumentQueryEvent,
    isLoading, isError, isSuccess, data, error: ErrorAddInstrument
  } = AddInstrumentQuery()

  useEffect(()=>{
    if(isError){
      console.log(ErrorAddInstrument)
    }

  },[ErrorAddInstrument])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(InstrumentSchema)
  });

  const selectedClient = watch('client');
  const selectedBrand = watch('brand');

  useEffect(()=>{
    if(instrument){
      setValue("serialNumber",instrument.serialNumber)  
      setValue("range",instrument.range)  
      setValue("description",instrument.description)  
      setValue("outOfService",instrument.outOfService)  
    }
  },[instrument])

  const { 
    data: officeList, 
    refetch: refetchGetOfficeByClientQuery 
  } = GetOfficeByClientQuery({options: {enable: false}, client: selectedClient})

  useEffect(()=>{
    instrument && setValue("client",(instrument.office as IOffice).client as any as string)  
  },[instrument, officeList])

  useEffect(()=>{
    instrument && setValue("instrumentType",(instrument.instrumentType as IINstrumentType).id as any as string)  
  },[instrument, instrumentType])

  useEffect(()=>{
    instrument && setValue("brand",((instrument.model as IModel).brand as IBrand).id as string)  
  },[instrument, brands])

  useEffect(()=>{
    instrument && officeList && setValue("office",(instrument.office as IOffice).id as any as string)  
  },[instrument, officeList])


  useEffect(() => {
    refetchGetOfficeByClientQuery()
  }, [selectedClient]);

  const { 
    data: modelList, 
    refetch: refetchGetModelsQuery
  } = GetModelsQuery({options: {enable: false}, brand: selectedBrand})

  useEffect(()=>{
    instrument && modelList && setValue("model",(instrument.model as IModel).id)  
  },[instrument, modelList])

  useEffect(() => {
    refetchGetModelsQuery()
  }, [selectedBrand]);
  
  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    if(instrument){
      values.id = instrument.id
    }
    AddInstrumentQueryEvent(values)
  };
  

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmitHandler)} >
                  <Stack spacing={3}>
                      
                      <Input placeholder='Numero de Serie' size='md' {...register("serialNumber")} />
                      {errors.serialNumber && <Text color="red.500">{errors.serialNumber.message}</Text>}

                      <Select placeholder='Seleccione un cliente' {...register("client")} >
                          {allClients && allClients.map((client) => (
                              <option key={client.id} value={client.id}>
                                  {client.socialReason}
                              </option>
                          ))}
                      </Select>
                      {errors.client && <Text color="red.500">{errors.client.message}</Text>}
                      
                      <Flex>
                        <Select placeholder='Seleccione la sucursal' {...register("office")} >
                            {officeList && officeList.map((office, index) => (
                                <option key={office.id} value={office.id}>
                                    {office.name ? office.name + " -" : ""} {office.city.name}
                                </option>
                            ))}
                        </Select>
                        { selectedClient !== ""  && <ITMButton template="light" onClick={()=> setCreateNewOffice(!createNewOffice)} maxW={"min-content"} marginLeft={2} >
                           { !createNewOffice ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton>}
                        {errors.office && <Text color="red.500">{errors.office.message}</Text>}
                      </Flex>
                      { createNewOffice && selectedClient !== ""
                        &&
                        <FormCreateOrUpdateOfficeForm client={selectedClient} refetch={refetchGetOfficeByClientQuery}/>
                      }

                      

                      <Flex>
                        <Select placeholder='Seleccione un tipo de instrumento' {...register("instrumentType")} >
                            {instrumentType && instrumentType.sort((a, b) => {
                                  return a.type.localeCompare(b.type);
                                }).map((type, index) => (
                                <option key={type.id} value={type.id}>
                                    {type.type}
                                </option>
                            ))}
                        </Select>
                        <ITMButton template="light" onClick={()=> setCreateNewInstrumentType(!createNewInstrumentType)} maxW={"min-content"} marginLeft={2} >
                           { !createNewInstrumentType ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton>
                      </Flex>
                      { createNewInstrumentType
                        &&
                        <FormCreateOrUpdateInstrumentTypeForm refetchInstrumentTypes={refetchInstrumentTypes}/>
                      }

                      { errors.instrumentType && <Text color="red.500">{errors.instrumentType.message}</Text> }

                      <Flex>
                        <Select placeholder='Seleccione una marca' {...register("brand")} >
                            {brands && brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </Select>
                        <ITMButton template="light" onClick={()=> setCreateNewBrand(!createNewBrand)} maxW={"min-content"} marginLeft={2} >
                           { !createNewBrand ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton>
                      </Flex>
                      { createNewBrand
                        &&
                        <FormCreateOrUpdateBrandForm refetch={refetchBrands}/>
                      }
                      {errors.brand && <Text color="red.500">{errors.brand.message}</Text>}
                      <Flex>
                      <Select placeholder='Seleccione un modelo del instrumento' {...register("model")} >
                          {modelList && modelList.map((model, index) => (
                              <option key={model.id} value={model.id}>
                                  {model.name}
                              </option>
                          ))}
                      </Select>
                      { selectedBrand && <ITMButton template="light" onClick={()=> setCreateNewModel(!createNewModel)} maxW={"min-content"} marginLeft={2} >
                           { !createNewModel ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton> }
                      </Flex>
                      { createNewModel && selectedBrand
                        &&
                        <FormCreateOrUpdateModelForm refetch={refetchGetModelsQuery} brand={selectedBrand}/>
                      }
                      {errors.model && <Text color="red.500">{errors.model.message}</Text>}

                      <Input placeholder='Rango' size='md' {...register("range")} />
                      {errors.range && <Text color="red.500">{errors.range.message}</Text>}

                      <Input placeholder='Descripcion' size='md' {...register("description")} />
                      {errors.description && <Text color="red.500">{errors.description.message}</Text>}

                      <Flex align="center">
                        <Checkbox {...register("outOfService")} defaultChecked={instrument?.outOfService} colorScheme='red'>
                          Equipo fuera de servicio
                        </Checkbox>
                        
                        <ItmPopover content={POP_OVER_CONTENT.instrumentOutOfService} />
                        
                      </Flex>

                      { !instrument && <Flex align="center">
                        <Checkbox {...register("sendEmailNotification")}>
                          Enviar notificación por correo electrónico a los usuarios.
                        </Checkbox>
                      </Flex>}
                      
                      {errors.sendEmailNotification && (
                        <Text color="red.500">{errors.sendEmailNotification.message}</Text>
                      )}
                      <br></br>
                  {
                    isSuccess &&  <Alert status='success'>
                    <AlertIcon />
                     Instrumento { !instrument ? "creado" : "actualizado"}
                  </Alert> 
                  }
                  {
                    isError && <Alert status='error'>
                    <AlertIcon />
                    Error creando el instrumento: {errorAddInstrument}
                  </Alert>
                  }

                  
                  <Button 
                      type="submit"
                      px={3}
                      bg={ "white"}
                      color={'itm.1000'}
                      borderColor={"itm.1000"} 
                      borderWidth={1} 
                      borderStyle="solid"
                      rounded={'md'}
                      maxWidth={"min-content"}
                  >
                      { isLoading && <SpinnerITM marginRight={5}/> } { !instrument ? "Crear" : "Actualizar" } instrumento
                  </Button>
                  </Stack>
              </form>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateInstrument;

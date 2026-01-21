import { GetAllStatesQuery, GetCitiesQuery } from "@/api/query/city.query";
import { AddOfficeQuery } from "@/api/query/office.query";
import { IOffice } from "@/api/types/office.type";
import useStore from "@/store";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Card, CardBody, Flex, Input, Select, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import ITMButton from "../Button";
import SpinnerITM from "../Spinner";
import FormCreateOrUpdateCityForm from "./CreateOrUpdateCityForm";
import FormCreateOrUpdateStateForm from "./CreateOrUpdateStateForm";

type props = {
  office?: IOffice;
  client: string,
  onClose?: any
  refetch?: () => void;
} 

const FormCreateOrUpdateOfficeForm = (props:props) => {
    const { office, client, refetch } = props
    const [ createNewState, setCreateNewState] = useState<boolean>(false)
    const [ createNewCity, setCreateNewCity] = useState<boolean>(false)
    const { data: stateList, refetch: refetchStates } = GetAllStatesQuery()
    const [errorTexto, setErrrorText] = useState<string>("")
    const store = useStore();

    useEffect(()=>{
      client && setValue("client", client);
    },
    [client])

    const UserSchema = Yup.object().shape({
        id: Yup.string(),
        client: Yup.string().required(),
        adress: Yup.string().required('La dirección es requerida'),
        name: Yup.string().required('El nombre es requerida'),
        phoneNumber: Yup.string().required('El telefono es requerido'),
        responsable: Yup.string(),
        city: Yup.string().required('La ciudad es requerida'),
        state: Yup.string().required("La provincia es requerida"),
    });
  
  type FormData = Yup.InferType<typeof UserSchema>;
    
    const {
      mutate: AddOfficeQueryEvent,
      isLoading, isError, isSuccess, error: ErrorAddOffce
    } = AddOfficeQuery()

    useEffect(()=>{
      if(isSuccess){
        refetch && refetch()
        store.setRefechUserList(!store.refechUserList)
      }
    },[isSuccess])

    useEffect(()=>{
      
      if( (ErrorAddOffce as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Sucursal ya existe")  
      }else{
        setErrrorText((ErrorAddOffce as any)?.response?.data?.error)  
      }
      
    },[ErrorAddOffce])
    
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(UserSchema)
    });

    useEffect(()=>{
      console.log(errors)
    },[errors])

    const state = watch("state")

    const { data: citiesList, refetch: refetchGetCitiesQuery } = GetCitiesQuery({enabled: false, state})

    useEffect(()=>{
      state && state !== "undefined" && refetchGetCitiesQuery()
    },[state])

    useEffect(() => {
      if (office) {
        office.id && setValue("id", office.id);
        setValue("client", client);
        setValue("phoneNumber", office.phoneNumber);
        setValue("responsable", office.responsable);
        setValue("name", office.name);
        setValue("adress", office.adress);
        
      }
    }, [setValue, office]);

    useEffect(()=>{
      stateList && office?.city && setValue("state", (office.city).state as string);
    },[office, office?.city, stateList])

    useEffect(()=>{
      citiesList && office?.city && setValue("city", (office.city).id as string);
    },[office, office?.city, citiesList])

  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddOfficeQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
              
                  <Stack spacing={3}>
                      
                      <Input placeholder='Nombre sucursal' size='md' {...register("name")} />
                      {errors.name && <Text color="red.500">{errors.name.message}</Text>}

                      <Flex>
                        <Select placeholder='Seleccione un provincia' {...register("state")} >
                            {stateList && stateList.map((state) => (
                                <option key={"p-"+state.id} value={state.id}>
                                    {state.nombre}
                                </option>
                            ))}
                        </Select>
                        <ITMButton template="light" onClick={()=> setCreateNewState(!createNewState)} maxW={"min-content"} marginLeft={2} >
                              { !createNewState ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton>
                      </Flex>
                      { createNewState
                        &&
                        <FormCreateOrUpdateStateForm refetch={refetchStates}/>
                      }
                      {errors.state && <Text color="red.500">{errors.state.message}</Text>}

                      <Flex>
                        <Select placeholder='Seleccione una ciudad' {...register("city")} >
                            {citiesList && citiesList.map((city) => (
                                <option key={"c-"+city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </Select>
                        { state && <ITMButton template="light" onClick={()=> setCreateNewCity(!createNewCity)} maxW={"min-content"} marginLeft={2} >
                            { !createNewCity ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton>}
                      </Flex>
                      { state && createNewCity
                        &&
                        <FormCreateOrUpdateCityForm refetch={refetchGetCitiesQuery} state={state} />
                      }
                      {errors.city && <Text color="red.500">{errors.city.message}</Text>}
                      
                      <Input placeholder='Dirección' size='md' {...register("adress")} />
                      {errors.adress && <Text color="red.500">{errors.adress.message}</Text>}

                      <Input placeholder='Número de telefono' size='md' {...register("phoneNumber")} />
                      {errors.phoneNumber && <Text color="red.500">{errors.phoneNumber.message}</Text>}

                      <Input placeholder='Contacto de Responsable' size='md' {...register("responsable")} />
                      {errors.responsable && <Text color="red.500">{errors.responsable.message}</Text>}

                      {
                      isSuccess &&  <Alert status='success'>
                      <AlertIcon />
                        Sucursal creada
                      </Alert> 
                    }

                    {
                      isError && <Alert status='error'>
                        <AlertIcon />
                        Error creando la sucursal: {errorTexto}
                      </Alert>
                    }
                  
                  <Button 
                      
                      px={3}
                      bg={ "white"}
                      color={'itm.1000'}
                      borderColor={"itm.1000"} 
                      borderWidth={1} 
                      borderStyle="solid"
                      rounded={'md'}
                      maxWidth={"min-content"}
                      onClick={handleSubmit(onSubmitHandler)}
                      
                  >
                      { isLoading && <SpinnerITM marginRight={5}/> }  { !office ? "Crear sucrusal" : "Actualizar sucursal"}
                  </Button>
                  </Stack>
              
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateOfficeForm;

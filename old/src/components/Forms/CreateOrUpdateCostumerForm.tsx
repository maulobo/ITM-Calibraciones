import { GetAllStatesQuery, GetCitiesQuery } from "@/api/query/city.query";
import { AddClientQuery } from "@/api/query/client.query";
import { ICity } from "@/api/types/city.types";
import { IClient } from "@/api/types/client.type";
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

type FormCreateOrUpdateUserPorps = {
  costumer?: IClient;
  onClose: any
} 

const FormCreateOrUpdateCostumerForm = (props:FormCreateOrUpdateUserPorps) => {
    const { costumer } = props
    const [ createNewCity, setCreateNewCity] = useState<boolean>(false)
    const [ createNewState, setCreateNewState] = useState<boolean>(false)
    const { data: stateList, refetch: refetchStates } = GetAllStatesQuery()
    const [errorTexto, setErrrorText] = useState<string>("")
    const store = useStore();

    const UserSchema = Yup.object().shape({
        id: Yup.string(),
        cuit: Yup.string().required('El cuit es requerida'),
        socialReason: Yup.string().required('La razón social es requerida'),
        phoneNumber: Yup.string().required('El telefono es requerido'),
        responsable: Yup.string(),
        city: Yup.string().required('La ciudad es requerida'),
        state: Yup.string().required("La provincia es requerida"),
    });
  
  type FormData = Yup.InferType<typeof UserSchema>;
    
    const {
      mutate: AddClientQueryEvent,
      isLoading, isError, isSuccess, error: ErrorAddClient
    } = AddClientQuery()

    useEffect(()=>{
      if(isSuccess){
        store.setRefechUserList(!store.refechUserList)
      }
    },[isSuccess])

    useEffect(()=>{
      
      if( (ErrorAddClient as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Cliente ya existe")  
      }
      
    },[ErrorAddClient])
    
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(UserSchema)
    });

    const state = watch("state")

    const { data: citiesList, refetch: refetchCities } = GetCitiesQuery({enabled: false, state})

    useEffect(()=>{
      state && state !== "undefined" && refetchCities()
    },[state])
    

    useEffect(() => {
      if (costumer) {
        costumer.id && setValue("id", costumer.id);
        setValue("cuit", costumer.cuit);
        setValue("socialReason", costumer.socialReason);
        setValue("phoneNumber", costumer.phoneNumber);
        setValue("responsable", costumer.responsable);
        
      }
    }, [setValue, costumer,]);

    useEffect(()=>{
      costumer && setValue("state", costumer.state as string);
    },[costumer && stateList])

    useEffect(()=>{
      costumer && setValue("city", (costumer.city as ICity).id);
    },[costumer && citiesList])

  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddClientQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmitHandler)} >
                  <Stack spacing={3}>

                      <Input placeholder='Cuit' size='md' {...register("cuit")} />
                      {errors.cuit && <Text color="red.500">{errors.cuit.message}</Text>}
                      
                      <Input placeholder='Razón Social' size='md' {...register("socialReason")} />
                      {errors.socialReason && <Text color="red.500">{errors.socialReason.message}</Text>}

                      <Input placeholder='Número de telefono' size='md' {...register("phoneNumber")} />
                      {errors.phoneNumber && <Text color="red.500">{errors.phoneNumber.message}</Text>}

                      <Input placeholder='Contacto de Responsable' size='md' {...register("responsable")} />
                      {errors.responsable && <Text color="red.500">{errors.responsable.message}</Text>}

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
                        <FormCreateOrUpdateCityForm refetch={refetchCities} state={state} />
                      }
                      {errors.city && <Text color="red.500">{errors.city.message}</Text>}

                      
                      {
                      isSuccess &&  <Alert status='success'>
                      <AlertIcon />
                      Cliente creado
                    </Alert> 
                    }
                  {
                    isError && <Alert status='error'>
                      <AlertIcon />
                      Error creando el cliente: {errorTexto}
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
                      { isLoading && <SpinnerITM marginRight={5}/> }  { !costumer ? "Crear cliente" : "Actualizar cliente"}
                  </Button>
                  </Stack>
              </form>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateCostumerForm;

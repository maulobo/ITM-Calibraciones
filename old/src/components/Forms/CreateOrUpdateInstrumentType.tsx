import { AddInstrumentTypeQuery } from "@/api/query/instruments-type.query";
import { Alert, AlertIcon, Button, Card, CardBody, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import SpinnerITM from "../Spinner";


type props = {
    refetchInstrumentTypes: () => void;
  };

const FormCreateOrUpdateInstrumentTypeForm = (props:props) => {
    const { refetchInstrumentTypes } = props
    const [errorTexto, setErrrorText] = useState<string>("")

    const UserSchema = Yup.object().shape({
        type: Yup.string().required("El tipo de insturmento es requerido"),
        description: Yup.string()
    });
  
  type FormData = Yup.InferType<typeof UserSchema>;
    
    const {
      mutate: AddInstrumentTypeEvent,
      isLoading, isError, isSuccess, error: ErrorAddOffce
    } = AddInstrumentTypeQuery()

    useEffect(()=>{
        refetchInstrumentTypes()
    },[isSuccess])


    useEffect(()=>{
      
      if( (ErrorAddOffce as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Sucursal ya existe")  
      }else{
        console.log({ErrorAddOffce})
        setErrrorText((ErrorAddOffce as any)?.response?.data?.error)  
      }
      
    },[ErrorAddOffce])
    
    

    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(UserSchema)
    });

    useEffect(()=>{
      console.log({errors})
    },[errors])


  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddInstrumentTypeEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
            <Stack spacing={3}>
                      <b>Nuevo tipo de instrumento.</b>
                      <Input placeholder='Nuevo tipo de instrumento' size='md' {...register("type")} marginRight={2} />
                      {errors.type && <Text color="red.500">{errors.type.message}</Text>}

                      <Input placeholder='Descripcion del tipo de instrumento' size='md' {...register("description")} marginRight={2} />
                      {errors.description && <Text color="red.500">{errors.description.message}</Text>}
                  
                  <Button 
                      onClick={handleSubmit(onSubmitHandler)}
                      px={3}
                      bg={ "white"}
                      color={'itm.1000'}
                      borderColor={"itm.1000"} 
                      borderWidth={1} 
                      borderStyle="solid"
                      rounded={'md'}
                      maxWidth={"min-content"}
                  >
                      { isLoading && <SpinnerITM marginRight={5}/> }  { "Crear tipo de instrumento"}
                  </Button>
                  

                  {
                        isSuccess &&  <Alert status='success'>
                        <AlertIcon />
                        Tipo de instrumento creado
                        </Alert> 
                        }
                  {
                    isError && <Alert status='error'>
                      <AlertIcon />
                      Error creando el tipo de instrumento: {errorTexto}
                    </Alert>
                  }
                  </Stack>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateInstrumentTypeForm;

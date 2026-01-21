
import { AddStateQuery } from "@/api/query/city.query";
import { Alert, AlertIcon, Button, Card, CardBody, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import SpinnerITM from "../Spinner";


type props = {
    refetch: () => void;
  };

const FormCreateOrUpdateStateForm = (props:props) => {
    const { refetch } = props
    const [errorTexto, setErrrorText] = useState<string>("")

    const Schema = Yup.object().shape({
        nombre: Yup.string().required("El nombre de la provincia es requerido"),
    });
  
  type FormData = Yup.InferType<typeof Schema>;
    
    const {
      mutate: AddStateQueryEvent,
      isLoading, isError, isSuccess, error: ErrorAddState
    } = AddStateQuery()

    useEffect(()=>{
        refetch()
    },[isSuccess])


    useEffect(()=>{
      
      if( (ErrorAddState as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Provincia ya existe")  
      }else{
        console.log({ErrorAddState})
        setErrrorText((ErrorAddState as any)?.response?.data?.error)  
      }
      
    },[ErrorAddState])
    
    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(Schema)
    });

    useEffect(()=>{
      console.log({errors})
    },[errors])


  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddStateQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
            <Stack spacing={3}>
                      <b>Nueva provincia:</b>
                      <Input placeholder='Nombre de provincia' size='md' {...register("nombre")} marginRight={2} />
                      {errors.nombre && <Text color="red.500">{errors.nombre.message}</Text>}

                  
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
                      { isLoading && <SpinnerITM marginRight={5}/> }  { "Crear provincia"}
                  </Button>
                  

                  {
                        isSuccess &&  <Alert status='success'>
                        <AlertIcon />
                        Provincia creada
                        </Alert> 
                        }
                  {
                    isError && <Alert status='error'>
                      <AlertIcon />
                      Error creando la provincia: {errorTexto}
                    </Alert>
                  }
                  </Stack>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateStateForm;

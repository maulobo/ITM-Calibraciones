import { AddBrandQuery } from "@/api/query/brands.query";
import { Alert, AlertIcon, Button, Card, CardBody, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import SpinnerITM from "../Spinner";


type props = {
    refetch: () => void;
  };

const FormCreateOrUpdateBrandForm = (props:props) => {
    const { refetch } = props
    const [errorTexto, setErrrorText] = useState<string>("")

    const Schema = Yup.object().shape({
        name: Yup.string().required("El nombre de la marca es requerido"),
    });
  
  type FormData = Yup.InferType<typeof Schema>;
    
    const {
      mutate: AddBrandQueryEvent,
      isLoading, isError, isSuccess, error: ErrorAddOffce
    } = AddBrandQuery()

    useEffect(()=>{
        refetch()
    },[isSuccess])


    useEffect(()=>{
      
      if( (ErrorAddOffce as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Marca ya existe")  
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
      resolver: yupResolver(Schema)
    });

    useEffect(()=>{
      console.log({errors})
    },[errors])


  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddBrandQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
            <Stack spacing={3}>
                      <b>Nuevo marca de instrumento.</b>
                      <Input placeholder='Nueva marca de instrumento' size='md' {...register("name")} marginRight={2} />
                      {errors.name && <Text color="red.500">{errors.name.message}</Text>}

                  
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
                      { isLoading && <SpinnerITM marginRight={5}/> }  { "Crear marca de instrumento"}
                  </Button>
                  

                  {
                        isSuccess &&  <Alert status='success'>
                        <AlertIcon />
                        Marca de instrumento creado
                        </Alert> 
                        }
                  {
                    isError && <Alert status='error'>
                      <AlertIcon />
                      Error creando la marca de instrumento: {errorTexto}
                    </Alert>
                  }
                  </Stack>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateBrandForm;

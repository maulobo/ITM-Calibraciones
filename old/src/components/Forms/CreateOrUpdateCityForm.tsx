import { AddCityQuery } from "@/api/query/city.query";
import { Alert, AlertIcon, Button, Card, CardBody, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import SpinnerITM from "../Spinner";


type props = {
    refetch: () => void;
    state: string,
  };

const FormCreateOrUpdateCityForm = (props:props) => {
    const { refetch, state } = props
    const [errorTexto, setErrrorText] = useState<string>("")

    useEffect(()=>{
      state && setValue("state",state)
    },[state])

    const Schema = Yup.object().shape({
        name: Yup.string().required("El nombre de la ciudad es requerido"),
        state: Yup.string().required("La provinca de la ciudad es requerido"),
    });
  
  type FormData = Yup.InferType<typeof Schema>;
    
    const {
      mutate: AddCityQueryEvent,
      isLoading, isError, isSuccess, error: ErrorAddCity
    } = AddCityQuery()

    useEffect(()=>{
        refetch()
    },[isSuccess])


    useEffect(()=>{
      
      if( (ErrorAddCity as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Ciudad ya existe")  
      }else{
        console.log({ErrorAddCity})
        setErrrorText((ErrorAddCity as any)?.response?.data?.error)  
      }
      
    },[ErrorAddCity])
    
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue
    } = useForm<FormData>({
      resolver: yupResolver(Schema)
    });

    useEffect(()=>{
      console.log({errors})
    },[errors])


  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddCityQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
            <Stack spacing={3}>
                      <b>Nueva ciudad.</b>
                      <Input placeholder='Nombre de ciudad' size='md' {...register("name")} marginRight={2} />
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
                      { isLoading && <SpinnerITM marginRight={5}/> }  { "Crear ciudad"}
                  </Button>
                  

                  {
                        isSuccess &&  <Alert status='success'>
                        <AlertIcon />
                        Ciudad creada
                        </Alert> 
                        }
                  {
                    isError && <Alert status='error'>
                      <AlertIcon />
                      Error creando la ciudad: {errorTexto}
                    </Alert>
                  }
                  </Stack>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateCityForm;

import { RecoverUserPasswordQuery } from '@/api/query/auth.query';
import useStore from '@/store';
import { Alert, AlertDescription, AlertIcon, Heading, IconButton, Stack, Text } from '@chakra-ui/react';

import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as Yup from "yup";
import ITMButton from '../Button';
import SpinnerITM from '../Spinner';
  
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email es requerido'),
});

type FormData = Yup.InferType<typeof LoginSchema>;

type Props = {
  setShowRecoverPassword: Dispatch<SetStateAction<boolean>>,
  setRecoverPassword: Dispatch<SetStateAction<boolean>>
  
}

export default function RecoverPasswordForm(props:Props) {
  const { setShowRecoverPassword, setRecoverPassword } = props
  const { push } = useRouter();
  const store = useStore();
  const {
    mutate: RecoverUserPasswordQueryEvent,
    isLoading, isError, isSuccess, data, error
  } = RecoverUserPasswordQuery()

    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(LoginSchema)
    });

    useEffect(()=>{
      if(isSuccess){
        setShowRecoverPassword(false) 
        setRecoverPassword(true)
      }
    },[isSuccess, data])

    const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
      RecoverUserPasswordQueryEvent(values);
    };

    const handleErorr = () => {
      if (error instanceof AxiosError) {
        
        if (error.response?.status === 404) {
          if(error.response.data.error.errorCode === 1005)
            return <span>{error.response.data.error.message}</span>
          if(error.response.data.error.errorCode === 1006)
            return <span>{error.response.data.error.message}</span>
          return <span>{ error.response.data.error.message ?? "Servidor no encontrado" }</span>
        }
    
        if (error.response?.status === 500) {
          return <span>Hubo un problema con el servidor.</span>
        }
      }
      
      return <span>Error desconocido</span>
    }

    const handleBackClick =  () => {
      setShowRecoverPassword(false)
    }
    
    return (
      <>
              
              <Heading fontSize={'2xl'} color={"itm.1000"}>
              <IconButton
                  aria-label="Regresar"
                  icon={<ArrowBackIcon />}
                  onClick={handleBackClick}
                  maxWidth={"min-content"}
                  marginRight={5}
              />
                Recuperar contraseña</Heading>
              <form onSubmit={handleSubmit(onSubmitHandler)} >

              
                <FormControl id="email" marginBottom={5}>
                  <FormLabel>Email:</FormLabel>
                  <Input type="email" {...register("email")}/>
                  {errors.email && <Text color="red.500">{errors.email.message}</Text>}
                </FormControl>
                
                { isError && <Alert status='error' marginBottom={5}>
                    <AlertIcon />
                    <AlertDescription>{ handleErorr() }</AlertDescription>
                  </Alert>
                  }

                <Stack spacing={10}>
                  <ITMButton template='dark' type='submit'>
                      { isLoading ? <><SpinnerITM/> Cargando.. </>:"Recuperar contraseña"}
                  </ITMButton>
                </Stack>
              </form>
        </>
    );
  }
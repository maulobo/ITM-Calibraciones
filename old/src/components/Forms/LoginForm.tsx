import { LoginUserQuery } from '@/api/query/auth.query';
import ITMButton from '@/components/Button';
import SpinnerITM from '@/components/Spinner';
import { UserRolesEnum } from '@/const/userRoles.const';
import { RouteNamesEnum } from '@/routes/routeNames.const';
import useStore from '@/store';
import { Alert, AlertDescription, AlertIcon, Heading, Stack, Text } from '@chakra-ui/react';

import {
    Checkbox,
    FormControl,
    FormLabel,
    Input,
    Link
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as Yup from "yup";
  
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email es requerido'),
  password: Yup.string()
    .required('El password es requerido'),
  remember: Yup.boolean()
});

type FormData = Yup.InferType<typeof LoginSchema>;
type Props = {
    setShowRecoverPassword: Dispatch<SetStateAction<boolean>>
}
export default function LoginForm(props:Props) {
    const { setShowRecoverPassword } =  props
  const { push } = useRouter();
  const store = useStore();
  const {
    mutate: LoginUserEvent,
    isLoading, isError, isSuccess, data, error
  } = LoginUserQuery()

    useMemo(() => {
      store.reset();
    }, []);

    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(LoginSchema)
    });

    useEffect(()=>{
      if(data){
        store.setIsLoggedIn(true);
        const role = data.payload.roles[0]
        store.setToken(data.access_token);
        store.setUserRoles(role);
        store.setAuthUser(data.payload);
        
        if(role === UserRolesEnum.CLIENT)
          push(RouteNamesEnum.USER_LANDING);
        
        if([UserRolesEnum.TECHNICAL, UserRolesEnum.ADMIN].includes(role))
          push(RouteNamesEnum.TECHNICAL_LANDING);
      }
    },[isSuccess, data])

    const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
      LoginUserEvent(values);
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
    
        if (error.response?.status === 401) {
          return <span>Usuario no autorizado.</span>
        }
    
        if (error.response?.status === 500) {
          return <span>Hubo un problema con el servidor.</span>
        }
      }
      
      return <span>Error desconocido</span>
    }
    
    return (
      <>
              <Heading fontSize={'2xl'} color={"itm.1000"}>Iniciar sesión</Heading>
              <form onSubmit={handleSubmit(onSubmitHandler)} >
                <FormControl id="email">
                  <FormLabel>Email:</FormLabel>
                  <Input type="email" {...register("email")}/>
                  {errors.email && <Text color="red.500">{errors.email.message}</Text>}
                </FormControl>
                <FormControl id="password" marginBottom={5}>
                  <FormLabel>Password:</FormLabel>
                  <Input type="password" {...register("password")} />
                  {errors.password && <Text color="red.500">{errors.password.message}</Text>}
                </FormControl>
                <Stack spacing={10}>
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    align={'start'}
                    justify={'space-between'}>
                    <Checkbox {...register("remember")}>Recordarme</Checkbox>
                    <Link color={'blue.400'} onClick={()=>{ setShowRecoverPassword(true) }}>¿Olvidaste la contraseña?</Link>
                  </Stack>

                  { isError && <Alert status='error'>
                    <AlertIcon />
                    <AlertDescription>{ handleErorr() }</AlertDescription>
                  </Alert>
                  }
                  <ITMButton template='dark' type='submit'>
                    { isLoading ? <><SpinnerITM/> Cargando.. </>:"Iniciar sesión"}
                  </ITMButton>
              </Stack>
              </form>
        </>
    );
  }
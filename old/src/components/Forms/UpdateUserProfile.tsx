import { UpdateUserProfileQuery } from "@/api/query/profile.query";
import { Alert, AlertIcon, Button, Flex, FormLabel, Input, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import SpinnerITM from "../Spinner";


const UpdatePasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .required('La contraseña es requerida'),
  repeatPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Por favor, vuelve a escribir tu contraseña'),
});

type FormData = Yup.InferType<typeof UpdatePasswordSchema>;

const FormUpateUserProfile = () => {   
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(UpdatePasswordSchema)
  });

  const {
    mutate: UpdateUserProfileQueryEvent,
    isLoading, isError, isSuccess, error: ErrorUpdateUser
  } = UpdateUserProfileQuery()
  
  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    UpdateUserProfileQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
              <form onSubmit={handleSubmit(onSubmitHandler)} >
                  <Stack spacing={3}>

                      <FormLabel>Actualizar password:</FormLabel>
                      <Input placeholder='Nuevo password' size='md' {...register("password")} />
                      {errors.password && <Text color="red.500">{errors.password.message}</Text>}
                      <Input placeholder='Repetir Password' size='md' {...register("repeatPassword")} />
                      {errors.repeatPassword && <Text color="red.500">{errors.repeatPassword.message}</Text>}
                      

                  {
                    isSuccess &&  <Alert status='success'>
                    <AlertIcon />
                     Conttraseña actualizada
                  </Alert> 
                  }

                  {
                    isError && <Alert status='error'>
                    <AlertIcon />
                    Error actualizando la contraseña
                  </Alert>
                  }

                  <Button 
                      type="submit"
                      w={'full'}
                      mt={8}
                      px={3}
                      bg={ "white"}
                      color={'itm.1000'}
                      borderColor={"itm.1000"} 
                      borderWidth={1} 
                      borderStyle="solid"
                      rounded={'md'}
                      maxWidth={"min-content"}
                      margin={"auto"}
                  >
                      {isLoading ?? <SpinnerITM marginRight={5}/> } Actualizar
                  </Button>
                  </Stack>
              </form>
        </Flex>
  );
};

export default FormUpateUserProfile;

import { AddUserQuery } from "@/api/query/auth.query";
import { GetAllClientsQuery } from "@/api/query/client.query";
import { GetOfficeByClientQuery } from "@/api/query/office.query";
import { IOffice } from "@/api/types/office.type";
import { IAddUser } from "@/api/types/user.types";
import useStore from "@/store";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Card, CardBody, Flex, Input, Select, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import ITMButton from "../Button";
import SpinnerITM from "../Spinner";
import FormCreateOrUpdateOfficeForm from "./CreateOrUpdateOfficeForm";

type FormCreateOrUpdateUserPorps = {
  user?: IAddUser;
  onClose: any
} 





const FormCreateOrUpdateUser = (props:FormCreateOrUpdateUserPorps) => {
    const { user } = props
    const { data: allClients } = GetAllClientsQuery()
    const [createNewOffice, setCreateNewOffice ] = useState<boolean>(false)
    const [errorTexto, setErrrorText] = useState<string>("")
    const store = useStore();

    const UserSchema = Yup.object().shape({
      client: Yup.string()
        .required('El cliente es requerida'),
      office: Yup.string()
        .required('La sucursal es requerida'),
      area: Yup.string(),
      password: user ? Yup.string() : Yup.string().required('El password es requerido'),
      id: Yup.string(),
      name: Yup.string()
        .required('El nombre es requerida'),
      lastName: Yup.string()
        .required('El apellido es requerido'),
      email: Yup.string()
        .required('El apellido es requerido'),
      phoneNumber: Yup.string(),
      adress: Yup.string(),
    });
    
    type FormData = Yup.InferType<typeof UserSchema>;

    const generatePassword = () => {
      const newPassword = Math.random().toString(36).slice(-8);
      setValue("password", newPassword);
    };
    
    const {
      mutate: AddUserQueryEvent,
      isLoading, isError, isSuccess, error: ErrorAddUser
    } = AddUserQuery()

    useEffect(()=>{
      if(isSuccess){
        store.setRefechUserList(!store.refechUserList)
      }
    },[isSuccess])

    useEffect(()=>{
      
      if( (ErrorAddUser as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Usuario ya existe")  
      }
      
    },[ErrorAddUser])
    
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(UserSchema)
    });
    const selectedClient = watch('client');

    useEffect(() => {
      if (user) {
        setValue("id", user.id);
        setValue("name", user.name);
        setValue("lastName", user.lastName);
        setValue("client", (user.office as IOffice)?.client?.id || "");
        setValue("phoneNumber", user.phoneNumber);
        setValue("email", user.email);
        console.log(user)
      }
    }, [setValue, user]);

    const { 
      data: officeList,
      refetch: refetchGetOfficeByClientQuery
    } = GetOfficeByClientQuery({options: {enable: false}, client: selectedClient})

    const client = watch("client")

    useEffect(()=>{
      if(user){
        setValue("office", (user.office as IOffice)?.id || "");
      }
    }, [officeList])
  
  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    AddUserQueryEvent(values)
  };

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmitHandler)} >
                  <Stack spacing={3}>

                      <Select placeholder='Seleccione un cliente' {...register("client")} >
                          {allClients?.map((client, index) => (
                              <option key={index} value={client.id}>
                                  {client.socialReason}
                              </option>
                          ))}
                      </Select>
                      {errors.client && <Text color="red.500">{errors.client.message}</Text>}
                      <Flex>
                        <Select placeholder='Seleccione la sucursal' {...register("office")} >
                            {officeList?.map((office, index) => (
                                <option key={index} value={office.id}>
                                    {office.name}
                                </option>
                            ))}
                        </Select>
                        <ITMButton template="light" onClick={()=> setCreateNewOffice(!createNewOffice)} maxW={"min-content"} marginLeft={2} >
                              { !createNewOffice ? <AddIcon/> : <MinusIcon/>}
                        </ITMButton>
                      </Flex>
                      {errors.office && <Text color="red.500">{errors.office.message}</Text>}

                      { createNewOffice
                        &&
                        <FormCreateOrUpdateOfficeForm client={client} refetch={refetchGetOfficeByClientQuery}/>
                      }

                      <Input placeholder='Área' size='md' {...register("area")} />
                      
                      <Input placeholder='Nombre' size='md' {...register("name")} />
                      {errors.name && <Text color="red.500">{errors.name.message}</Text>}

                      <Input placeholder='Apellido' size='md' {...register("lastName")} />
                      {errors.lastName && <Text color="red.500">{errors.lastName.message}</Text>}

                      <Input placeholder='Email' size='md' {...register("email")} />
                      {errors.email && <Text color="red.500">{errors.email.message}</Text>}
                      
                      <Flex flexFlow={"row"} gap={2}>
                        <Input maxWidth={"60%"} placeholder='Password' size='md' {...register("password")} />
                        <ITMButton template="light" maxWidth={"min-content"} onClick={generatePassword}>{user ? "Nueva" :"Generar"} Contraseña</ITMButton>
                      </Flex>
                      

                      <Input placeholder='Telefono (opcional)' size='md' {...register("phoneNumber")} />
                      {errors.phoneNumber && <Text color="red.500">{errors.phoneNumber.message}</Text>}

                      <Input placeholder='Direccion (opcional)' size='md' {...register("adress")} />
                      {errors.adress && <Text color="red.500">{errors.adress.message}</Text>}
                      {
                      isSuccess &&  <Alert status='success'>
                      <AlertIcon />
                      Usuario creado
                    </Alert> 
                    }
                  {
                    isError && <Alert status='error'>
                      <AlertIcon />
                      Error creando el usuario: {errorTexto}
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
                      { isLoading && <SpinnerITM marginRight={5}/> }  { !user ? "Crear usuario" : "Actualizar usuario"}
                  </Button>
                  </Stack>
              </form>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateUser;

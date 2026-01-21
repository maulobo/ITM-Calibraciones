import { GetAdminTechUsersQuery, GetUsersQuery } from "@/api/query/auth.query";
import { AddBadgetQuery } from "@/api/query/badgets.query";
import { GetAllClientsQuery } from "@/api/query/client.query";
import { GetOfficeByClientQuery } from "@/api/query/office.query";
import { IBadget } from "@/api/types/badgets.type";
import { IInstrument } from "@/api/types/instrument.type";
import { IOffice } from "@/api/types/office.type";
import { IUser } from "@/api/types/user.types";
import ButtonDowloadBadget from "@/components/ButtonDowloadBadget";
import { BadgetTypeENUM, CurrencyENUM, Notes, NotesLabelENUM, VatENUM, VatLabel } from "@/const/badget.const";
import useStore from "@/store";
import { Alert, AlertIcon, Button, Card, CardBody, Checkbox, CheckboxGroup, Flex, FormControl, FormLabel, Input, Select, Stack, Text, Textarea } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import SpinnerITM from "../../Spinner";
import SubFormDetails from "../SubFormBadgetDetails";
import BadgetSchema from "../schemas/Badget.schema";
import TableInstrumentRelated from "./TableInstrumentRelated";

type FormCreateOrUpdateBadgetPorps = {
  badget?: IBadget;
  setBadgetTitle: (newNumber: string) => void;
} 

const initialBadget: IBadget = {
    types: [],
    id: "",
    number: 0,
    year: 23,
    office: "",
    user: "",
    attention: "",
    date: "",
    reference: "",
    deliveryTime: "",
    offerValidity: 0,
    paymentTerms: "",
    currency: "",
    vat: VatENUM.NO_IVA,
    notes: "",
    selectedNotes: [],
    details: [],
    showTotal: true,
    instrumentsRelated:[]
};

const FormCreateOrUpdateBadget = (props:FormCreateOrUpdateBadgetPorps) => {
    const { badget, setBadgetTitle } = props
    const [ getUserparams, setGetUserparams ] = useState({})
    const { data: allClients } = GetAllClientsQuery()
    const [selectedNotes, setSelectedNotes] = useState<string[]>( badget?.selectedNotes || []);
    const [selectedTypes, setSelectedTypes] = useState<string[]>( badget?.types || []);
    const [notesText, setNotesText] = useState<string>("");
    const [errorTexto, setErrrorText] = useState<string>("")
    const [instrumentsRelated, setInstrumentsRelated] = useState<IInstrument[]>([])
    const store = useStore();
    const currentUser = store.authUser
    const defaultValues = badget || initialBadget;
    type FormData = Yup.InferType<typeof BadgetSchema>;

    const { 
      data: adminList
    } = GetAdminTechUsersQuery();

    useEffect(()=>{
      !badget && currentUser && setValue("advisor", currentUser.id)
    },[badget,currentUser,adminList])

    const handleNotesCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = event.target;
      if (checked) {
        setSelectedNotes([...selectedNotes, value]);
      } else {
        setSelectedNotes(selectedNotes.filter((clause) => clause !== value));
      }
    };

    const handleTypesCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = event.target;
      if (checked) {
        setSelectedTypes([...selectedTypes, value]);
      } else {
        setSelectedTypes(selectedTypes.filter((clause) => clause !== value));
      }
    };

    const {
      mutate: AddBadgetQueryEvent,
      data: AddBadgetData,
      isLoading, isError, isSuccess, error: ErrorAddBadget
    } = AddBadgetQuery()

   
    useEffect(()=>{
      if( (ErrorAddBadget as any)?.response?.data?.error?.errorCode === 1000 ){
        setErrrorText("Presupuesto ya existe")  
      }
      
    },[ErrorAddBadget])
    
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors }
    } = useForm<FormData>({
      resolver: yupResolver(BadgetSchema),
      //@ts-ignore
      defaultValues: defaultValues
    });
    
    useEffect(()=>{
      console.log({errors})
    },[errors])

    const selectedClient = watch('client');
    const selectedOffice = watch('office');
    const currency = watch('currency');
    const showTotal = watch('showTotal') || false

    useMemo(()=>{
      setValue("instrumentsRelated",instrumentsRelated.map( i => i.id ))
    },[instrumentsRelated])

    useMemo(() => {
      const newSelectedNotes: NotesLabelENUM[] = [];
      if(!badget){
        if (badget && selectedTypes.includes(BadgetTypeENUM.CALIBRATION)) {
          newSelectedNotes.push(
            NotesLabelENUM.GARANTIA,
            NotesLabelENUM.VALIDEZ_OFERTA,
            NotesLabelENUM.LUGAR_ENTREGA,
            NotesLabelENUM.CALIBRACION_AUTORIZADA,
          );
        }
  
        if (selectedTypes.includes(BadgetTypeENUM.MAINTENCE)) {
          newSelectedNotes.push(
            NotesLabelENUM.SEGURO_TRANSPORTE,
            NotesLabelENUM.RESTRICCION_IMPORTACION,
          )
        }
        setSelectedNotes(newSelectedNotes);
      }

      
    }, [selectedTypes]);

    useMemo(()=>{
      //@ts-ignore
      const text = selectedNotes.map( clause => Notes[clause] ).join("<br/><br/>")
      setNotesText(text)
      setValue("notes", text)
      setValue("selectedNotes", selectedNotes)
    },[selectedNotes])

    useMemo(()=>{
      setValue("types", selectedTypes)
    },[selectedTypes])

    const { 
      data: officeList
    } = GetOfficeByClientQuery({options: {enable: false}, client: selectedClient})

    useEffect(()=>{
      if(badget){
        setValue("office", (badget.office as IOffice).id || "");
      }
    }, [officeList])

    const { 
      data: UserList, 
      isSuccess:isSuccessUserList, 
    } = GetUsersQuery({ options: {enable: false}, params: getUserparams });

  

    useEffect(()=>{
      if (isSuccessUserList && UserList && badget && badget.user) {
        setValue("user", (badget.user as any as IUser).id);
      }
    }, [UserList])

    useEffect(()=>{
      setGetUserparams({find:{office:selectedOffice}})
    },[selectedOffice])

    
    const currentDate = new Date();
    const initDate = `${currentDate.getFullYear()}-${("0" + (currentDate.getMonth() + 1)).slice(-2)}-${("0" + currentDate.getDate()).slice(-2)}`;  
    useEffect(() => {
      if (badget) {
        const formDate = new Date(badget.date)
        const formDateFormated = `${formDate.getFullYear()}-${("0" + (formDate.getMonth() + 1)).slice(-2)}-${("0" + formDate.getDate()).slice(-2)}`;  
        const instrumentsRelatedSN = (badget.instrumentsRelated as IInstrument[]).map( i => i.serialNumber)
        if(badget.instrumentsRelated) setInstrumentsRelated(badget.instrumentsRelated as IInstrument[])
        setValue("id", badget.id);
        setValue("date", formDateFormated);
        setValue("client", (badget.office as any as IOffice).client?.id);
        setValue("attention", badget.attention);
        setValue("deliveryTime", badget.deliveryTime);
        setValue("offerValidity", badget.offerValidity);
        setValue("reference", badget.reference);
        setValue("currency", badget.currency);
        setValue("vat", badget.vat);
        setValue("paymentTerms", badget.paymentTerms);
        setValue("notes", badget.notes);
        setValue("details", badget.details);
        setValue("selectedNotes", badget.selectedNotes);
        setValue("advisor", badget.advisor?.id);
        setValue("notes", badget.notes);
        setValue("instrumentsRelated", instrumentsRelatedSN);
        setNotesText(badget.notes || "")
        setSelectedNotes(badget?.selectedNotes || []);
        setSelectedTypes(badget?.types || []);
      }else{
        setValue("date", initDate);
      }
    }, [setValue, badget]);
  
  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    values.notes = notesText
    if(values.user === ""){
      delete values.user
    }
    //@ts-ignore
    AddBadgetQueryEvent(values);
  };

  useEffect(()=>{
    if(isSuccess && AddBadgetData){
      setBadgetTitle(`Presupuesto ${AddBadgetData.year}-${AddBadgetData.number}`)
    }
  },[isSuccess, AddBadgetData])

  const methods = useForm()

  return (
    <Flex flexFlow={"column"} gap={4}>
    <Card>
      <CardBody>
        <Flex justifyContent="" alignItems="center" mb={3}>
          <b><h3>ASESOR: </h3></b>
          <Select placeholder='Seleccione un usuario' {...register("advisor")} width={"200px"} ml={5}>
                    {adminList?.map((user, index) => (
                      <option key={`u-${index}`}  value={user.id}>
                        {user.name}, {user.lastName}
                      </option>
                    ))}
                  </Select>
                  <br></br>
        </Flex>
        <hr />
        <br></br>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitHandler)}>
            <Stack spacing={3}>
              <Flex flexFlow="row" gap={4} alignItems="center">
              
                <FormControl>
                    <FormLabel fontWeight="semibold" fontSize="sm">Tipo de presupuesto</FormLabel>
                    <CheckboxGroup  defaultValue={selectedTypes} value={selectedTypes}>
                      <Stack spacing={[1, 5]} direction={['row']}>
                        {Object.values(BadgetTypeENUM).map((type, index) => (
                            <Checkbox key={`t-${index}`} value={type} onChange={handleTypesCheckboxChange}>
                              {type}
                            </Checkbox>
                          ))}
                      </Stack>
                  </CheckboxGroup>
                </FormControl>
              </Flex>

              <Flex flexFlow="row" gap={4} alignItems="center">
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Cliente</FormLabel>
                  <Select placeholder='Seleccione un cliente' {...register("client")}>
                    {allClients?.map((client, index) => (
                      <option key={`c-${index}`}  value={client.id}>
                        {client.socialReason}
                      </option>
                    ))}
                  </Select>
                  {errors.client && <Text color="red.500">{errors.client.message}</Text>}
                </FormControl>
  
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Sucursal</FormLabel>
                  <Select placeholder='Seleccione la sucursal' {...register("office")}>
                    {officeList?.map((office, index) => (
                      <option key={`o-${index}`}  value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </Select>
                  {errors.office && <Text color="red.500">{errors.office.message}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Usuarios de la sucursal</FormLabel>
                  <Select placeholder='Usuarios de la sucursal' {...register("user")}>
                    {UserList?.map((user, index) => (
                      <option key={`u-${index}`} value={user.id}>
                        {user.name}, {user.lastName}
                      </option>
                    ))}
                  </Select>
                  {errors.user && <Text color="red.500">{errors.user.message}</Text>}
                </FormControl>
              </Flex>
  
              <Flex flexFlow="row" gap={4} alignItems="center">
              <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Referencia</FormLabel>
                  <Input placeholder='Referencia' size='md' {...register("reference")} />
                  {errors.reference && <Text color="red.500">{errors.reference.message}</Text>}
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Fecha</FormLabel>
                  <Input type="date" placeholder='Fecha' size='md' {...register("date")} />
                  {errors.date && <Text color="red.500">{errors.date.message}</Text>}
                </FormControl>
  
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Cliente sin usuario</FormLabel>
                  <Input placeholder='Cliente sin usuario' size='md' {...register("attention")} />
                </FormControl>
              </Flex>
  
              <Flex flexFlow="row" gap={4} alignItems="center">
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Plazo de entrega</FormLabel>
                  <Input placeholder='Plazo de entrega' size='md' {...register("deliveryTime")} />
                  {errors.deliveryTime && <Text color="red.500">{errors.deliveryTime.message}</Text>}
                </FormControl>
  
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Validez de la oferta en días</FormLabel>
                  <Input type="number" placeholder='Validez de la oferta' size='md' {...register("offerValidity")} />
                  {errors.offerValidity && <Text color="red.500">{errors.offerValidity.message}</Text>}
                </FormControl>
              </Flex>
  
              <Flex flexFlow="row" gap={4} alignItems="center">
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">Moneda</FormLabel>
                  <Select placeholder={"Tipo de moneda"}  {...register("currency")} >
                    {Object.values(CurrencyENUM).map((currency, index) => (
                      <option key={`m-${index}`}  value={currency}>
                        {currency}
                      </option>
                    ))}
                  </Select>
                  {errors.currency && <Text color="red.500">{errors.currency.message}</Text>}
                </FormControl>
  
                <FormControl>
                  <FormLabel fontWeight="semibold" fontSize="sm">IVA</FormLabel>
                  <Select {...register("vat")} >
                  {Object.entries(VatENUM).map(([key, value]) => (
                      <option key={key} value={value}>
                        {VatLabel[value]}
                      </option>
                    ))}
                  </Select>
                  {errors.vat && <Text color="red.500">{errors.vat.message}</Text>}
                </FormControl>

                <FormControl>
                <FormLabel fontWeight="semibold" fontSize="sm">Forma de pago</FormLabel>
                <Input placeholder='Forma de pago' size='md' {...register("paymentTerms")} />
                {errors.paymentTerms && <Text color="red.500">{errors.paymentTerms.message}</Text>}
              </FormControl>

              </Flex>

              <Alert status='info'>
                <AlertIcon />
                Para enlazar un instrumento con el presupuesto debe incluir el Número de serie en la descripcicón. Por ejemplo "N/S: ABC-123"
              </Alert>
              
              <SubFormDetails instrumentsRelated={instrumentsRelated} setInstrumentsRelated={setInstrumentsRelated} selectedOffice={selectedOffice} defaultDetails={badget?.details} setValue={setValue} currency={currency} showTotal={showTotal} />
              
              { instrumentsRelated?.length > 0 ? <TableInstrumentRelated instruments={instrumentsRelated}/> : "" }

              <FormControl>
                <Checkbox {...register("showTotal")}>Mostrar total</Checkbox>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" fontSize="sm">Notas</FormLabel>
                <CheckboxGroup  defaultValue={selectedNotes} value={selectedNotes}>
                <Stack spacing={[1]} direction={['row',"column"]}>
                  {Object.entries(NotesLabelENUM).map(([key, label]) => (
                    <Checkbox key={`p-${key}`}  value={label} onChange={handleNotesCheckboxChange}>{label}</Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
              </FormControl>
              
              <span dangerouslySetInnerHTML={{ __html: notesText }} />

              <FormControl>
                  <Textarea 
                    className='col-span-4'
                    placeholder="Notas de precios"
                    {...register(`notes`)}
                    value={notesText}
                    hidden

                  />
              </FormControl>              
  
              {isSuccess && <Alert status='success'>
                <AlertIcon />
                Presupuesto { badget ?  "actualizado" : "creado"}
              </Alert>}
  
              {isError && <Alert status='error'>
                <AlertIcon />
                Error creando el presupuesto: {errorTexto}
              </Alert>}

            <Flex>
              <Button
                type="submit"
                px={3}
                bg={"white"}
                color={'itm.1000'}
                borderColor={"itm.1000"}
                borderWidth={1}
                borderStyle="solid"
                rounded={'md'}
                maxWidth={"min-content"}
                marginRight={5}
              >
                
                { isLoading && <SpinnerITM marginRight={5} />}  {!badget ? "Crear presupuesto" : "Actualizar presupuesto"}

              </Button>
              
              { badget && <ButtonDowloadBadget badget={badget}/>}
              </Flex>

            </Stack>
          </form>
        </FormProvider>
      </CardBody>
    </Card>
  </Flex>
  
  );
};

export default FormCreateOrUpdateBadget;

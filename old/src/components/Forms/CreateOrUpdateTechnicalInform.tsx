import { AddTechnicalInformQuery } from "@/api/query/technical-inform.query";
import { IInstrument } from "@/api/types/instrument.type";
import { ITechnicalInform } from "@/api/types/technical-inform.types";
import useStore from "@/store";
import { Button, Flex, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import ITMButton from "../Button";
import SpinnerITM from "../Spinner";


const TechnicalInformSchema = Yup.object().shape({
    id: Yup.string(),
    equipment: Yup.string(),
    date: Yup.string()
      .required('La fecha es requerida'),
    comments: Yup.string()
      .required('El comentario es requerido'),
    descriptions: Yup.string()
      .required('La observacion es requerida'),
  });

type FormData = Yup.InferType<typeof TechnicalInformSchema>;

type CreateOrUpdateTechnicalInformProps = {
  instrument?: IInstrument;
  technicalInform?: ITechnicalInform;
  onClose: any
} & (
  {
    instrument: IInstrument;
  } | {
    technicalInform: ITechnicalInform;
  }
);

const CreateOrUpdateTechnicalInform = (createOrUpdateTechnicalInformProps: CreateOrUpdateTechnicalInformProps) => {
  const { instrument, technicalInform, onClose} = createOrUpdateTechnicalInformProps
  const store = useStore();
  const currentDate = new Date();
  const initDate = `${currentDate.getFullYear()}-${("0" + (currentDate.getMonth() + 1)).slice(-2)}-${("0" + currentDate.getDate()).slice(-2)}`;  
  const {
    mutate: AddTechnicalInformQueryEvent,
    isLoading, isError, isSuccess, data, error: ErrorAddTechnicalInform
  } = AddTechnicalInformQuery()

  useEffect(()=>{
    if(isSuccess){
      store.setRefechTechnicalInform(!store.refechTechnicalInform)
      onClose()  
    }
  },[isSuccess])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(TechnicalInformSchema)
  });

  useEffect(() => {
    if (technicalInform) {
      const formDate = new Date(technicalInform.date)
      const formDateFormated = `${formDate.getFullYear()}-${("0" + (formDate.getMonth() + 1)).slice(-2)}-${("0" + formDate.getDate()).slice(-2)}`;  
      setValue("date", formDateFormated);
      setValue("descriptions", technicalInform.descriptions);
      setValue("comments", technicalInform.comments);
    }else{
      setValue("date", initDate);
    }
  }, [setValue, technicalInform]);
  
  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    if(instrument){
      if(technicalInform){
        values.id = technicalInform.id as string  
      }
      values.equipment = instrument.id as string
      // @ts-ignore
      AddTechnicalInformQueryEvent(values)
    }
    
  };

  const handleWithoutProblems = () => {
    const text = "El equipo se verificó correctamente y se calibro sin presentar anomalías. Esto no quiere decir que a futuro no pueda presentar algún comportamiento erróneo. En caso de suceder algo así, enviar a Calibraciones ITM S.A. para una nueva verificación."
    setValue("descriptions", text);
    setValue("comments", "Sin comentarios.");

  }

  return (
        <Flex flexFlow={"column"} gap={4}>     
        <ITMButton template="light" onClick={handleWithoutProblems} maxWidth={"min-content"}>Sin incidencias</ITMButton>   
              <form onSubmit={handleSubmit(onSubmitHandler)} >
                  <Stack spacing={3}>
                      <Input type="date" placeholder='Fecha' size='md' {...register("date")} />
                      {errors.date && <Text color="red.500">{errors.date.message}</Text>}

                      <Textarea placeholder='Observaciones' size='md' {...register("descriptions")} />
                      {errors.descriptions && <Text color="red.500">{errors.descriptions.message}</Text>}

                      <Textarea placeholder='Comentarios' size='md' {...register("comments")} />
                      {errors.comments && <Text color="red.500">{errors.comments.message}</Text>}

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
                      { isLoading && <SpinnerITM marginRight={5}/>} 
                      { !technicalInform ? "Crear informe" : "Actualizar informe"} 
                  </Button>
                  </Stack>
              </form>
              
        </Flex>
  );
};

export default CreateOrUpdateTechnicalInform;

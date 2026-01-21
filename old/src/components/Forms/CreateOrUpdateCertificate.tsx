import { AddCertificateQuery } from "@/api/query/certificate.query";
import { ICertificate } from "@/api/types/certificate.types";
import { IInstrument } from "@/api/types/instrument.type";
import useStore from "@/store";
import { Alert, AlertIcon, Box, Button, Card, CardBody, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import ITMButton from "../Button";
import SpinnerITM from "../Spinner";

const CertificateSchema = Yup.object().shape({
    certificate: Yup.mixed(),
    number: Yup.string().required('El número de calibración es requerido'),
    calibrationDate: Yup.string().required('La fecha de calibración es requerida'),
    calibrationExpirationDate: Yup.string().required('La fecha de calibración es requerida'),
  });

type FormData = Yup.InferType<typeof CertificateSchema>;

type Props = {
    instrument?: IInstrument,
    certificate?: ICertificate
    onClose: any
}
const FormCreateOrUpdateCertificate = (props:Props) => {  
    const { instrument, certificate } = props
    const [hasError, setHasError] = useState(false);
    const store = useStore();
    const {
    mutate: AddCertificateQueryEvent,
    isLoading, isError, isSuccess, data, error: ErrorAddInstrument
  } = AddCertificateQuery()
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  useEffect(()=>{
    if(isSuccess){
      store.setRefechInstrumentList(!store.refechInstrumentList)
      store.setRefetch(!store.refetch)
    }
  },[isSuccess])

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(CertificateSchema),
    defaultValues: {
        calibrationDate: new Date().toISOString().split("T")[0],
      },
  });

  useEffect(()=>{
    if(certificate){
      setValue("number", certificate.number)
      setValue("calibrationDate", certificate.calibrationDate ? new Date(certificate.calibrationDate).toISOString().split("T")[0] : "")
      setValue("calibrationExpirationDate", certificate.calibrationExpirationDate ? new Date(certificate.calibrationExpirationDate).toISOString().split("T")[0] : "");
    }

  },[certificate])
  
  const onSubmitHandler: SubmitHandler<FormData> = async (values) => {
    if (!certificate) {
      if(!values.certificate){
        setError("certificate", { type: "manual", message: "El archivo del certificado es requerido" });
        setHasError(true);
        return;
      }
      const file = values.certificate[0];
      if (file.type !== "application/pdf") {
        setError("certificate", { type: "manual", message: "El archivo debe ser un PDF" });
        setHasError(true);
        return;
      }
    }
    
    // @ts-ignore
    const upload = values.certificate[0] as File;
    
    if(!instrument){
      console.log("No instrument")
      return
    }

    const params = {
        id: certificate?.id,
        equipment: instrument.id,
        calibrationDate: values.calibrationDate,
        calibrationExpirationDate: values.calibrationExpirationDate,
        number: values.number

    }

    AddCertificateQueryEvent({ params, upload });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setPdfPreview(preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMonths = (months: number) => {
    const calibrationDate = getValues("calibrationDate");
    const date = new Date(calibrationDate);
    date.setMonth(date.getMonth() + months);
    setValue("calibrationExpirationDate", date.toISOString().split("T")[0]);
  };
  

  return (
        <Flex flexFlow={"column"} gap={4}>        
          <Card>
            <CardBody>
            <form onSubmit={handleSubmit(onSubmitHandler)} encType="multipart/form-data">
              
                  <Stack spacing={3}>
                    
                    <Input type="text" placeholder='Número de certificado' size='md' {...register("number")} />
                    <Box border={"1px"} rounded={"5"} borderColor={"gray.200"} padding={10}>
                    <Stack spacing={5}>
                      <Flex flexDirection={"row"} alignItems='center' justifyContent={"space-around"}>
                          
                          <Flex flexDirection={"column"}>
                            <Text color={"green.500"} fontWeight={"bold"}>Fecha de calibracion</Text>
                            <Input type="date" placeholder='Fecha de calibracion' size='md' {...register("calibrationDate")} />
                            {errors.calibrationDate && <Text color="red.500">{errors.calibrationDate.message}</Text>}
                          </Flex>
                          
                          <Flex flexDirection={"column"}>
                            <Text color={"red.500"} fontWeight={"bold"}>Fecha de vencimiento</Text>
                            <Input type="date" placeholder='Fecha de vencimiento' size='md' {...register("calibrationExpirationDate")} />
                            {errors.calibrationExpirationDate && <Text color="red.500">{errors.calibrationExpirationDate.message}</Text>}
                          </Flex>

                          
                      </Flex>

                      <Flex flexDirection="row" alignContent={"center"} justifyContent={"center"} gap={2} marginBottom={10}>
                              <ITMButton
                                  template="light"
                                  onClick={() => handleAddMonths(1)}
                              >
                                  +1M
                              </ITMButton>
                              <ITMButton
                                  template="light"
                                  onClick={() => handleAddMonths(2)}
                              >
                                  +2M
                              </ITMButton>
                              <ITMButton
                                  template="light"
                                  onClick={() => handleAddMonths(3)}
                              >
                                  +3M
                              </ITMButton>
                              <ITMButton
                                  template="light"
                                  onClick={() => handleAddMonths(4)}
                              >
                                  +4M
                              </ITMButton>
                              <ITMButton
                                  template="light"
                                  onClick={() => handleAddMonths(6)}
                              >
                                  +6M
                              </ITMButton>
                          </Flex>
                          </Stack>
                      </Box>
                    
                    <Text marginTop={20} fontSize={13} fontWeight={"bold"}>Certificado PDF</Text>

                      <Input   
                        placeholder="Certificadfo (PDF)" 
                        size="md" 
                        type="file" {...register("certificate")}
                        onChange={handleFileChange}
                        />
                      {/* @ts-ignore */}
                      {errors.certificate && <Text color="red.500">{errors.certificate.message}</Text>}
                      { hasError && <span>Se produjo un error en el formulario</span>}
                      {pdfPreview && (
                          <embed
                            src={pdfPreview}
                            width="100%"
                            height="400px"
                            type="application/pdf"
                          />
                        )}

                  {
                    isSuccess && <Alert status='success'>
                    <AlertIcon />
                     Certificado creado
                    </Alert> 
                  }
                    

                  {
                    isError && <Alert status='error'>
                    <AlertIcon />
                    Error creando el Certificado
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
                      { isLoading && <SpinnerITM marginRight={5}/> } { isLoading ? "Subiendo archivo..." : 
                       certificate ? "Actualizar certificado":"Crear certificado"
                      }
                  </Button>
                  </Stack>
              </form>
              </CardBody>
            </Card>
        </Flex>
  );
};

export default FormCreateOrUpdateCertificate;

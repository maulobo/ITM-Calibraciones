import { GetTechnicalInformQuery } from '@/api/query/technical-inform.query';
import { IInstrument } from '@/api/types/instrument.type';
import useStore from '@/store';
import { Box, Card, CardBody, Heading, Stack, StackDivider, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ButtonDowloadTechnicaInform from './ButtonDowloadTechnicaInform';
import TechnicalInformModal from './Modals/TechnicalInformModal';

type TechnicalInform = {
  date: string;
  description: string;
  comments: string;
};

export interface Params {
  [key: string]: any;
}

type TechnicalInformProps = {
  instrument: IInstrument;
};

function TechnicalInform(props: TechnicalInformProps) {
  const { instrument } = props;
  const [params, setParams] = useState<Params>({});
  const store = useStore();
  const router = useRouter();
  const { refetch, data, isSuccess } = GetTechnicalInformQuery({enabled: false, options: { enabled: false }, params });
  
  useEffect(() => {
    if (instrument) {
      setParams({ 
        find:{
          equipment:instrument.id
      }})
      router.push({ query: { ...router.query, id: instrument.id } });
    }
  }, [instrument]);

  useEffect(() => {
    params && refetch();
  }, [params]);

  useEffect(() => {
    refetch();
  }, [store.refechTechnicalInform]);

  function formatDateString(dateString: string | Date): string {
    const date = new Date(Date.parse(dateString as string));
    const formattedDate = `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
    return formattedDate;
  }
 
  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" marginBottom={5} marginTop={5}>
        Informes técnicos
      </Heading>
      
      {data?.length === 0 && (
        <Card marginBottom={5}>
          <CardBody>
            <Text marginBottom={2}> Todavía no hay informes técnicos </Text>
          </CardBody>
        </Card>
      )}

      {data &&
        data
          .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          })
          .map((i, index) => (
            <Stack key={`card-${index}`} divider={<StackDivider />} spacing="4">
              <Card marginBottom={5} id={`card-${index}`}>
                <CardBody>
                  <Text marginBottom={2}>
                    <b>Fecha:</b> {i.date && formatDateString(i.date)}
                  </Text>
                  <Text marginBottom={2}>
                    <b>Descripcion:</b> {i.descriptions}
                  </Text>
                  <Text marginBottom={2}>
                    <b>Comentarios:</b> {i.comments}
                  </Text>
                    {i.id && <ButtonDowloadTechnicaInform id={i.id} serialNumber={instrument.serialNumber}/>}
                  {instrument && <TechnicalInformModal instrument={instrument} technicalInform={i} edit />}
                </CardBody>
              </Card>
            </Stack>
          ))}
    </Box>
  );
}

export default TechnicalInform;

import { GetPDFTechnicalInformQuery } from '@/api/query/pdf-generator.query';
import { useEffect } from 'react';
import { AiOutlineCloudDownload } from "react-icons/ai";
import ITMButton from './Button';
import SpinnerITM from './Spinner';

type Props = {
    id:string,
    serialNumber: string
}
function ButtonDowloadTechnicaInform(props:Props) {
    const { id, serialNumber } = props
    const { data: pdfData, refetch: refetchGetPDFTechnicalInformQuery, isFetching } = GetPDFTechnicalInformQuery({ enabled: false, id });
    useEffect(() => {
        if(pdfData){
          const url = window.URL.createObjectURL(new Blob([pdfData.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `informe_tecnico_${serialNumber}.pdf`); // Establece el nombre de archivo para la descarga
          document.body.appendChild(link);
          link.click();
        }
        
      },[pdfData])

  return (
    <ITMButton template="dark" float="right" marginTop={5} onClick={() => { refetchGetPDFTechnicalInformQuery(); }}>
        { isFetching ? <> <SpinnerITM color='white' marginRight={2}/>  Descargando... </> : <><AiOutlineCloudDownload style={{marginRight:5}} /> Descargar Informe</>}
    </ITMButton>
  )
}

export default ButtonDowloadTechnicaInform
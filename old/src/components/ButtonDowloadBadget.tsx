import { GetPDFBudgetQuery } from '@/api/query/pdf-generator.query';
import { IBadget } from '@/api/types/badgets.type';
import { useEffect } from 'react';
import { AiOutlineCloudDownload } from "react-icons/ai";
import ITMButton from './Button';
import SpinnerITM from './Spinner';

type Props = {
    badget: IBadget
}
function ButtonDowloadBadget(props:Props) {
    const { badget } = props
    const { data: pdfData, refetch, isFetching } = GetPDFBudgetQuery({ enabled: false, id: badget.id });
    
    useEffect(() => {
        if(pdfData){
          const url = window.URL.createObjectURL(new Blob([pdfData.data]));
          const link = document.createElement('a');
          link.href = url;
          // Presupuesto N° 23-3003 – ITM Calibraciones
          link.setAttribute('download', `Presupuesto Nº ${badget.year}-${badget.number} – ITM Calibraciones.pdf`); // Establece el nombre de archivo para la descarga
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
      },[pdfData])

  return (
    <ITMButton template="light" maxWidth={"fit-content"} float="right" onClick={() => { refetch(); }}>
        { isFetching ? <> <SpinnerITM marginRight={1}/> </> : <><AiOutlineCloudDownload />  </>}
    </ITMButton>
  )
}

export default ButtonDowloadBadget
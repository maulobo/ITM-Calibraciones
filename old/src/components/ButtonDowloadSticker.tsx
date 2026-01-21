import { GetPDFStickerQuery } from '@/api/query/pdf-generator.query';
import { IInstrument } from '@/api/types/instrument.type';
import { useEffect } from 'react';
import { AiOutlineCloudDownload } from "react-icons/ai";
import ITMButton from './Button';
import SpinnerITM from './Spinner';

type Props = {
    instrument: IInstrument
}
function ButtonDowloadTSticker(props:Props) {
    const { instrument } = props
    const { data: pdfData, refetch, isFetching } = GetPDFStickerQuery({ enabled: false, id: instrument.id });
    useEffect(() => {
        if(pdfData){
          const url = window.URL.createObjectURL(new Blob([pdfData.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `sticker_${instrument.serialNumber}.pdf`); // Establece el nombre de archivo para la descarga
          document.body.appendChild(link);
          link.click();
        }
        
      },[pdfData])

  return (
    <ITMButton template="light" float="right" onClick={() => { refetch(); }}>
        { isFetching ? <> <SpinnerITM color='white' marginRight={1}/>  Descargando... </> : <><AiOutlineCloudDownload style={{marginRight:2}} /> Sticker</>}
    </ITMButton>
  )
}

export default ButtonDowloadTSticker
import { GetInstrumentQuery } from '@/api/query/instruments.query';
import { useEffect, useState } from 'react';
import Select, { SingleValue } from 'react-select';

export interface Props {
  onChange: (serialNumber: any ) => void;
}

export interface Options {
  value: string | null;
  label: string;
  serialNumber: string | null;
}

export default function SerialNumberInputList(props: Props) {
  const [serialNumberList, setSerialNumberList] = useState<Options[]>([]);
  const params = {
    populate: ["office"],
    select: ['serialNumber', "office"],
  };
  const { data, isLoading } = GetInstrumentQuery({ params, enable: false });

  useEffect(() => {
    if (data) {
      const list: Options[] = data.map((i) => ({
        serialNumber: i.serialNumber,
        value: i.serialNumber,
        label: i.serialNumber,
      }));

      setSerialNumberList(list);
    }
  }, [data]);

  const handleOnChange = (e:SingleValue<Options>) => {
    if(e?.value) props.onChange({serialNumber: e?.value})
  }
  
  return (
    <Select
      className="basic-single"
      classNamePrefix="select"
      defaultValue={serialNumberList[0]}
      isLoading={isLoading}
      isClearable={true}
      isSearchable={true}
      options={serialNumberList}
      placeholder={"Seleccionar un N/S"}
      onChange={ (e) => handleOnChange(e) }
    />
  );
}

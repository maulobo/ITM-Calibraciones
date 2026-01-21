import { GetInstrumentQuery } from '@/api/query/instruments.query';
import { Detail } from '@/api/types/badgets.type';
import { IInstrument } from '@/api/types/instrument.type';
import { Button, Input, Textarea } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

const SERIA_NUMBER_PATTERN = /N\/S:\s?([\w\d\-_]+)/;

interface Params {
  populate: string[];
  find: {
    office: string;
    [key: string]: any;
  },
  [key: string]: any;
}

const SubFormDetails = ({ instrumentsRelated, setInstrumentsRelated, selectedOffice, setValue, defaultDetails, showTotal, currency }:{ instrumentsRelated:IInstrument[], setInstrumentsRelated: (instruments: IInstrument[]) => void; selectedOffice:string, setValue:any, defaultDetails?:Detail[], showTotal:boolean, currency: string}) => {
  const { register, setValue: setLocalValue, watch, formState: { errors } } = useFormContext();
  const [details, setDetails] = useState<Detail[]>([]);
  const [totalBadget, setTotalBadget] = useState<number>(0)
  const [params, setParams] = useState<Params>({
    populate:["model","model.brand","instrumentType"],
    find:{
      office: selectedOffice
    }
  })
  const [localItrumentRelated, setLocalItrumentRelated] = useState<{[key:string]:string}>({});
 
  const { data: dataGetInstrumentQuery, isLoading, refetch: refetchGetInstrument } = GetInstrumentQuery({ params, options: {enabled: false}, enabled: false });
  
  useEffect(()=>{
    const localSerialNumbers = Object.values(localItrumentRelated);
    const newItrumentRelated = instrumentsRelated.filter( i => localSerialNumbers.includes(i.serialNumber))
    setInstrumentsRelated(newItrumentRelated)
  },[localItrumentRelated])
  
  useMemo(()=>{
    if(showTotal){
      const sumaTotal = details.reduce((total, item) => {
        return total + item.totalPrice;
      }, 0);
      setTotalBadget(sumaTotal)
    }
  },[showTotal, details])

  const updateFormValues = (values:Detail[]) => {
    setDetails(values);
    setValue('details', values);
    setLocalValue('details', values);
  }

  useEffect(() => {
    if (defaultDetails) {
      updateFormValues(defaultDetails)
    } else {
      addDetail()
    }
  }, [defaultDetails]);

  const addDetail = () => {
    setDetails([...details, createEmptyDetail(details.length + 1)]);
  };

  const createEmptyDetail = (itemNumber: number) => ({
    itemNumber,
    quantity: 0,
    description: "",
    unitPrice: 0.00,
    discount: 0.00,
    totalPrice: 0.00,
  });

  const removeDetail = (index: number) => {
    const newDetails = [...details];
    newDetails.splice(index, 1);

    // Update item numbers
    for (let i = 0; i < newDetails.length; i++) {
      newDetails[i].itemNumber = i + 1;
    }

    setLocalItrumentRelated((prevParams) => {
      const { [index]: _, ...rest } = prevParams;
      return rest;
    });

    updateFormValues(newDetails)
  };

  useEffect(()=>{
    if(params) refetchGetInstrument()
    },[params])


    useEffect(() => {
      if (dataGetInstrumentQuery && dataGetInstrumentQuery.length > 0) {
        //@ts-ignore
        setInstrumentsRelated((prevInstruments: IInstrument[]) => {
          const uniqueSet = new Set([...prevInstruments, ...dataGetInstrumentQuery]);
          const uniqueArray = Array.from(uniqueSet);
          return uniqueArray;
        });
      }
    }, [dataGetInstrumentQuery]);
  
  const handleOnBlurInput = (index: number, field: keyof Detail, value: any) => {
    const newDetails = [...details];
    //@ts-ignore
    newDetails[index][field] = value;

    if(field === "description"){
      const match = newDetails[index].description.match(SERIA_NUMBER_PATTERN);
      if (match) {
        const serialNumber = match[1];
        
        const isSerialNumberAlreadyQuery = Object.values(localItrumentRelated).includes(serialNumber);
        if(!isSerialNumberAlreadyQuery){
          setParams(prevParams => ({
            ...prevParams,
            find: {
              ...prevParams.find,
              office: selectedOffice,
              serialNumber
            }
          }));
  
          setLocalItrumentRelated((prevParams) => ({
            ...prevParams,
            [index]: serialNumber,
          }));
        }
      }else{
        setLocalItrumentRelated((prevParams) => {
          const { [index]: _, ...rest } = prevParams;
          return rest;
        });
      }
    }
  }

  useEffect(()=>{
    if (Object.keys(localItrumentRelated).length !== instrumentsRelated.length) {
      defaultDetails?.forEach((d, index)=>{
        const match = d.description.match(SERIA_NUMBER_PATTERN);
        if(match){
          const serialNumber = match[1];
          setLocalItrumentRelated((prevParams) => ({
            ...prevParams,
            [index]: serialNumber,
          }));
        }
      })
    }
    
  },[localItrumentRelated, instrumentsRelated, defaultDetails])

  const handleInputChange = (index: number, field: keyof Detail, value: any) => {
    const newDetails = [...details];
    //@ts-ignore
    newDetails[index][field] = value;

    if (field === 'quantity' || field === 'discount' || field === 'unitPrice') {
      // Calculate the new totalPrice when quantity, discount, or unitPrice changes
      const quantity = parseFloat(String(newDetails[index].quantity)) || 0;
      const unitPrice = parseFloat(String(newDetails[index].unitPrice)) || 0;
      const discount = parseFloat(String(newDetails[index].discount)) || 0;
      newDetails[index].totalPrice = parseFloat((quantity * unitPrice * (1 - discount / 100)).toFixed(2));
    }

    updateFormValues(newDetails)
  };

  return (
    <>
      <div className="grid grid-cols-10 gap-2">
      <div className="font-bold text-center col-span-1 text-sm">Item</div>
      <div className="font-bold text-center col-span-1 text-sm">Cantidad</div>
      <div className="font-bold text-center col-span-4 text-sm">Descripción</div>
      <div className="font-bold text-center col-span-1 text-sm">Precio Unitario</div>
      <div className="font-bold text-center col-span-1 text-sm">Bonificación (%)</div>
      <div className="font-bold text-center col-span-1 text-sm">Precio Final</div>
      <div className="font-bold text-center col-span-1 text-sm"></div> {/* Espacio vacío para el botón de eliminación */}
        
        {details.map((detail, index) => (
          <React.Fragment key={index}>
            <input
              className='text-center col-span-1'
              type="number"
              readOnly
              name={`details[${index}].itemNumber`}
              value={index+1}
            />

            <Input 
              className='text-center col-span-1'
              type="number"
              placeholder="Cantidad"
              defaultValue={detail.quantity}
              {...register(`details[${index}].quantity`)}
              onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
            />

            <Textarea 
              className='col-span-4'
              placeholder="Descripción"
              defaultValue={detail.description}
              {...register(`details[${index}].description`)}
              onChange={(e) => handleInputChange(index, 'description', e.target.value)}
              onBlur={(e) => handleOnBlurInput(index, 'description', e.target.value)}

            />

            <Input 
              type="number"
              className='text-center col-span-1'
              placeholder="Precio Unitario"
              defaultValue={detail.unitPrice}
              {...register(`details[${index}].unitPrice`)}
              onChange={(e) => handleInputChange(index, 'unitPrice', e.target.value)}
            />

            <Input 
              type="number"
              className='text-center col-span-1'
              placeholder="Bonificación"
              defaultValue={detail.discount}
              {...register(`details[${index}].discount`)}
              onChange={(e) => handleInputChange(index, 'discount', e.target.value)}
            />

            <Input 
              readOnly
              type="number"
              className='text-center col-span-1'
              placeholder="Precio Final"
              defaultValue={detail.quantity}
              {...register(`details[${index}].totalPrice`)}
              onChange={(e) => handleInputChange(index, 'totalPrice', e.target.value)}
            />

            <div className='text-center col-span-1'>
              <Button 
                px={3}
                bg={ "white"}
                color={'itm.1000'}
                borderColor={"itm.1000"} 
                borderWidth={1} 
                borderStyle="solid"
                rounded={'md'}
                maxWidth={"min-content"}
                onClick={() => removeDetail(index)}
                >
                X
                </Button>
            </div>
            
          </React.Fragment>
        ))}
      </div>
      { showTotal && <div>
          Total del presupuesto: { currency } ${ totalBadget } 
      </div> }
      <Button 
          className='m-auto'
          px={3}
          bg={ "white"}
          color={'itm.1000'}
          borderColor={"itm.1000"} 
          borderWidth={1} 
          borderStyle="solid"
          rounded={'md'}
          maxWidth={"min-content"}
          onClick={addDetail}
      >
         Agregar item
      </Button>
    </>
  );
};

export default SubFormDetails;
import { GetInstrumentQuery, UpdateInstrumentQuery } from "@/api/query/instruments.query";
import { ICertificate } from "@/api/types/certificate.types";
import { IInstrument } from "@/api/types/instrument.type";
import { IINstrumentType } from "@/api/types/intruments-type.type";
import { IModel } from "@/api/types/models.type";
import { DownloadCertificate } from "@/commons/dowloadCertificate";
import ITMButton from "@/components/Button";
import { ColumnDropdown } from "@/components/ColumnDropDown";
import { DataTable } from "@/components/DataTable";
import ExpiredMonthlyInstruments from "@/components/ExpiredMonthlyInstruments";
import Statics from "@/components/Statics";
import Title from "@/components/Title";
import WrapperDataTable from "@/components/WrapperDataTable";
import InstrumentBadge, { getInstrumentState, getTypeInstrumentBadge } from "@/components/instrumentBadge";
import { EquipmentStateEnum } from "@/const/equipmentState.const";
import { UserRolesEnum } from "@/const/userRoles.const";
import withAuth from "@/routes/withAuth";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { Box, Card, CardBody, Flex, Input, Select } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { saveAs } from 'file-saver';
import { useRouter } from "next/router";
import Papa from 'papaparse';
import { useEffect, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import * as XLSX from 'xlsx';

export interface Params{
    populate?: string[],
    select?: string[],
    options?: object
}

const params:Params = {
    populate: ["model.brand", "instrumentType"]
}

function LandingPage() {
    const router = useRouter()
    const { data: instruments } = GetInstrumentQuery({ params })
    const [stateFilter, setStateFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [instrumentsType, setinstrumentsType] = useState<IINstrumentType[]>([])
    const columnHelper = createColumnHelper<IInstrument>();
    const [filteredData, setFilteredData] = useState<IInstrument[]>(instruments || []);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumns, setShowColumns] = useState<any[]>([]);
    const [expirationDateFilter, setExpirationDateFilter] = useState<string | number>("ALL");
    

    const {
        mutate: UpdateInstrumentQueryEvent,
        isLoading, isError, isSuccess, data, error: ErrorUpdateInstrument
      } = UpdateInstrumentQuery()
    
    const cbEditableColumns = (id: string, value:string, header:string) => {
        if(header === "label") UpdateInstrumentQueryEvent({id, label:value})
        if(header === "customSerialNumber") UpdateInstrumentQueryEvent({id, customSerialNumber:value})
    }

    const handleColumnToggle = (updatedColumns: string[]) => {
        setSelectedColumns(updatedColumns);
    };

    useEffect(() => {
        const instrumentsTypesSet = new Set<IINstrumentType>();
        instruments?.forEach((i) => {
          instrumentsTypesSet.add(i.instrumentType as IINstrumentType);
        });
      
        const instrumentsTypes: IINstrumentType[] = Array.from(instrumentsTypesSet);
        setinstrumentsType(instrumentsTypes);
      }, [instruments]);

    useEffect(() => {
        let filtered = instruments || [];

        if (search !== "") {
            filtered = filtered.filter(item => item.serialNumber.includes(search) || item.customSerialNumber?.includes(search));
        }
    
        if (stateFilter !== "ALL") {
            filtered = filtered.filter((item) => {
                return getInstrumentState(item.calibrationExpirationDate) === stateFilter
            });
        }
    
        if (typeFilter !== "ALL") {
            filtered = filtered.filter(item => (item.instrumentType as IINstrumentType).id === typeFilter);
        }

        if (expirationDateFilter !== "ALL") {
            const currentDate = new Date();
          
            filtered = filtered.filter((item) => {
              const expirationDate = new Date(item.calibrationExpirationDate);
              const daysUntilExpiration = Math.floor((expirationDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
              if (expirationDateFilter === 30 && daysUntilExpiration <= 30) {
                return true;
              }
          
              if (expirationDateFilter === 60 && daysUntilExpiration > 30 && daysUntilExpiration <= 60) {
                return true;
              }
          
              if (expirationDateFilter === 90 && daysUntilExpiration > 60 && daysUntilExpiration <= 90) {
                return true;
              }
          
              if (expirationDateFilter === 91 && daysUntilExpiration > 90) {
                return true;
              }
          
              return false;
            });
          }
          
        setFilteredData(filtered);
    }, [stateFilter, typeFilter, search, instruments, expirationDateFilter]);
    

    const handleOpenCard = (id:string) => {
        router.push(`/instrument?id=${id}`);
    }

    const handleDowloadCertificate = ({certificate}:{certificate:string}) => {
        certificate && DownloadCertificate({certificate})
    }

    const columns = [
        //@ts-ignore
        columnHelper.accessor("instrumentType", {
            id:"instrumentType",
            cell: (info) => {
                const type = info.getValue() as unknown as IINstrumentType
                return type.type
            },
            header: "Tipo"
        }),
        columnHelper.accessor("serialNumber", {
            id:"serialNumber",
            cell: (info) => info.getValue(),
            header: "Número de serie"
        }),
        columnHelper.accessor("customSerialNumber", {
            id: 'customSerialNumber',
            cell: (info) => {
                const customSerialNumber = info.getValue()
                const instrument = info.row.original as IInstrument;
                if(customSerialNumber) return customSerialNumber
                return instrument.serialNumber
            },
            header: "N/S alternativo"
        }),
        columnHelper.accessor("label", {
            id: 'label',
            cell: (info) => {
                const label = info.getValue()
                const instrument = info.row.original as IInstrument;
                if(label) return label
                return instrument.serialNumber
            },
            header: "Identificador"
        }),
        // columnHelper.accessor("description", {
        //     id:"description",
        //     cell: (info) => {
        //         return info.getValue() || " - "
        //     },
        //     header: "Descripción"
        // }),
        columnHelper.accessor("model", {
            id: 'brand',
            cell: (info) => {
                const model = info.getValue() as unknown as IModel
                return model.brand.name
            },
            header: "Marca"
        }),
        columnHelper.accessor("model", {
            id:"model",
            cell: (info) => {
                const model = info.getValue() as unknown as IModel
                return model.name
            },
            header: "Modelo",
        }),
        columnHelper.accessor("calibrationExpirationDate", {
            id: 'state',
            cell: (info) => {
                const instrument = info.row.original as IInstrument;
                if(instrument.outOfService){
                    return InstrumentBadge({state:EquipmentStateEnum.OUT_OF_SERFVICE})
                }
                return getTypeInstrumentBadge(instrument.calibrationExpirationDate) 
            },
            header: "Estado",
        }),
        columnHelper.accessor("calibrationExpirationDate", {
            id:"calibrationExpirationDate",
            cell: (info) => {
                if(!info.getValue()) return " Sin fecha "
                const formDate = new Date(info.getValue())
                return `${("0" + formDate.getDate()).slice(-2)}-${("0" + (formDate.getMonth() + 1)).slice(-2)}-${formDate.getFullYear()}`;  
            },
            header: "Vencimiento",
        }),
       
        columnHelper.accessor("certificate", {
            id: 'downloadCertificate',
            cell: (info) => {
                const instrument = info.row.original as IInstrument;
                const certificate = instrument.certificate as ICertificate
                return instrument.certificate ? <ITMButton template={"dark"} onClick={()=> handleDowloadCertificate({certificate: info.getValue() as string}) }>
                    <AiOutlineCloudDownload />
                </ITMButton> : "No hay certificados"
            },
            header: "Certificado",
        }),
        columnHelper.accessor("id", {
            id: 'openCard',
            cell: (info) => {
              return (
                <ITMButton
                    template={"dark"} onClick={()=> handleOpenCard(info.getValue()) }
                >
                  <BsEye />
                </ITMButton>
              );
            },
            header: "Ficha",
          }),
    ];

    useEffect(()=>{
        columns && setSelectedColumns( columns.map(c => c.id ?? "" ) )
    },[])

    useEffect(()=>{
        setShowColumns( columns.filter( c => c.id && selectedColumns.includes(c.id) ) )
    },[selectedColumns])

    const transformDataForCSV = (filteredData:IInstrument[]) => {
        return filteredData.map((instrument) => {
          return {
            "numero de serie": instrument.serialNumber,
            "n/s alternativo": instrument.customSerialNumber,
            estado: getInstrumentState(instrument.calibrationExpirationDate),
            modelo: (instrument.model as unknown as IModel).name,
            marca:  (instrument.model as unknown as IModel).brand.name,
            tipo: (instrument.instrumentType as unknown as IINstrumentType).type,
            rango: instrument.range,
            vencimiento: instrument.calibrationExpirationDate ?? "Sin fecha"
          };
        });
      };

    const fileHeaders = ['numero de serie', "n/s alternativo",'estado', 'modelo', "marca", "tipo", "rango", "vencimiento"]
    
    const handleDownloadCSV = () => {
        const transformedData = transformDataForCSV(filteredData);
        const csv = Papa.unparse(transformedData,{
            columns: fileHeaders,
            header: true
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        saveAs(blob, 'listado_instrumentos.csv');
    }
    
    const handleDownloadExcel = () => {
        const transformedData = transformDataForCSV(filteredData);
        const worksheet = XLSX.utils.json_to_sheet(transformedData, {
            header: fileHeaders
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'listado_instrumentos.xlsx');
    }
    
    
  return (
    
    <Box padding='1'>
        <Title title="Lista de Instrumentos"/>
        
                <Flex flexDirection="row" gap={5} align="stretch">
        <Card marginBottom={10} width="40%" flex="1">
            <CardBody>
            {instruments && (
                <ExpiredMonthlyInstruments
                setExpirationDateFilter={setExpirationDateFilter}
                instruments={instruments}
                />
            )}
            </CardBody>
        </Card>

        <Card marginBottom={10} width="60%">
            <CardBody>
            <Statics instruments={filteredData} />
            </CardBody>
        </Card>
        </Flex>
        
        <Flex flexDirection={"row"} gap={5} align={"center"}>
            <span className="text-itm font-semibold py-3">Filtrar: </span>
                <Input
                    placeholder='Buscar N/S'
                    htmlSize={10}
                    width='auto'
                    onChange={e => setSearch(e.target.value)} // update the search state when the user types
                />
                <Select 
                    width={"3xs"}
                    onChange={(e) => setStateFilter(e.target.value)}
                >
                    <option key={"0"} value={"ALL"}>
                        {"Todos los estados"}
                    </option>
                    {Object.values(EquipmentStateEnum).map((state, index) => (
                        <option key={index} value={state}>
                        {state}
                        </option>
                    ))}
                </Select>
                
                <Select 
                    width={"3xs"}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option key={"0"} value={"ALL"}>
                        {"Todos los tipos"}
                    </option>
                    {instrumentsType?.map((i) => (
                        <option key={i.id} value={i.id}>
                        {i.type}
                        </option>
                    ))}
                </Select>

                <ColumnDropdown
                    columns={columns}
                    selectedColumns={selectedColumns}
                    onColumnToggle={handleColumnToggle}
                />
                
                <ITMButton template="light" onClick={handleDownloadCSV}>
                    <ArrowDownIcon marginRight={3} />
                    CSV
                </ITMButton>

                <ITMButton template="light" onClick={handleDownloadExcel}>
                    <ArrowDownIcon marginRight={3} />
                    Excel
                </ITMButton>
        </Flex>
        
        
        
        <WrapperDataTable>
            <DataTable 
                    columns={showColumns} 
                    data={filteredData} 
                    centeredColumns={["Ficha Técnica","Certificado"]} 
                    editableColumns={["Identificador", "N/S alternativo"]}
                    cbEditableColumns={cbEditableColumns}
                />
        </WrapperDataTable>
            
    </Box>
    
  );
}

export default withAuth(LandingPage, [UserRolesEnum.CLIENT]);
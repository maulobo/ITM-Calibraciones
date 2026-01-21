import { GetAllClientsQuery } from "@/api/query/client.query";
import { GetInstrumentsTypeQuery } from "@/api/query/instruments-type.query";
import { GetInstrumentQuery, UpdateInstrumentReceivedStatusQuery } from "@/api/query/instruments.query";
import { ICertificate } from "@/api/types/certificate.types";
import { IInstrument } from "@/api/types/instrument.type";
import { IINstrumentType } from "@/api/types/intruments-type.type";
import { IModel } from "@/api/types/models.type";
import { IOffice } from "@/api/types/office.type";
import { certificateDateFormat } from "@/commons/dateTimeFunctions";
import { DownloadCertificate } from "@/commons/dowloadCertificate";
import ITMButton from "@/components/Button";
import { ColumnDropdown } from "@/components/ColumnDropDown";
import { DataTable } from "@/components/DataTable";
import CreateOrUpdateCertificateModal from "@/components/Modals/CreateOrUpdateCertificateModal";
import Statics from "@/components/Statics";
import Title from "@/components/Title";
import WrapperDataTable from "@/components/WrapperDataTable";
import InstrumentBadge, { getInstrumentState, getTypeInstrumentBadge } from "@/components/instrumentBadge";
import { EquipmentStateEnum } from "@/const/equipmentState.const";
import { UserRolesEnum } from "@/const/userRoles.const";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import withAuth from "@/routes/withAuth";
import useStore from "@/store";
import { AddIcon, ArrowUpIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Box, Card, CardBody, Flex, Input, Select, Switch } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { BsEye } from "react-icons/bs";

export interface Params{
    populate?: string[],
    select?: string[],
    options?: object
}

const params:Params = {
    populate: ["model.brand", "instrumentType", "office.client", "office.city"]
}

function LandingPage() {
    const router = useRouter()
    const { data: instrumentsType } = GetInstrumentsTypeQuery()
    const { data: allClients } = GetAllClientsQuery()
    const [stateFilter, setStateFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [clientFilter, setClientFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const { data: dataGetInstrumentQuery, refetch } = GetInstrumentQuery({ params })
    const [allInstruments, setAllInstruments] = useState<IInstrument[]>([]);
    const [filteredData, setFilteredData] = useState<IInstrument[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCertificate, setEditCertificate] = useState<ICertificate>();
    const [instrumentSelected, setInstrumentSelected] = useState<IInstrument>()
    const columnHelper = createColumnHelper<IInstrument>();
    const store = useStore();
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumns, setShowColumns] = useState<any[]>([]);

    useEffect(()=>{
        refetch()
    },[store.refechInstrumentList])

    useEffect(()=>{
        dataGetInstrumentQuery && setAllInstruments(dataGetInstrumentQuery)
    },[dataGetInstrumentQuery])

    const handleColumnToggle = (updatedColumns: string[]) => {
        setSelectedColumns(updatedColumns);
      };

    const {
        mutate: UpdateInstrumentReceivedStatusQueryEvent,
        isLoading, isError, isSuccess, data: dataUpdateInstrumentReceivedStatusQuery, error: ErrorUpdateInstrument
      } = UpdateInstrumentReceivedStatusQuery()

      useEffect(() => {
        if (dataUpdateInstrumentReceivedStatusQuery) {
          const updatedInstruments = allInstruments.map((instrument) => {
            if (instrument.id === dataUpdateInstrumentReceivedStatusQuery.id) {
              // Reemplazar el instrumento con el nuevo instrumento actualizado
              return dataUpdateInstrumentReceivedStatusQuery;
            }
            // Mantener el instrumento original sin cambios
            return instrument;
          });
      
          // Actualizar el estado de allInstruments con el nuevo array de instrumentos actualizados
          setAllInstruments(updatedInstruments);
        }
      }, [dataUpdateInstrumentReceivedStatusQuery]);

    useEffect(() => {
        let filtered = allInstruments || [];

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

        if (clientFilter !== "ALL") {
            filtered = filtered.filter(item => (item.office as IOffice).client?.id === clientFilter);
        }
    
        setFilteredData(filtered);
    }, [stateFilter, typeFilter, clientFilter, search, allInstruments]);
    

    const handleOpenCard = (id:string) => {
        router.push(`/instrument?id=${id}`);
    }

    const handleDowloadCertificate = ({certificate}:{certificate:string}) => {
        certificate && DownloadCertificate({certificate})
    }

    const handleInstrumentReceived = (instrument:IInstrument, received:boolean) => {
        const id = instrument.id
        
        UpdateInstrumentReceivedStatusQueryEvent({
            id,
            received
        })

    }

    const columns = [
        //@ts-ignore
        columnHelper.accessor("office", {
            id: 'client',
            cell: (info) => {
                const office = info.getValue() as unknown as IOffice
                const client = office?.client?.socialReason
                return client || "Sin cliente"
            },
            header: "Cliente"
        }),
        columnHelper.accessor("office", {
            id: 'office',
            cell: (info) => {
                const office = info.getValue() as unknown as IOffice
                return office?.name || "Sin sucursal"
            },
            header: "Sucursal"
        }),
        // columnHelper.accessor("description", {
        //     id: "description",
        //     cell: (info) => {
        //         return info.getValue() || " - "
        //     },
        //     header: "Descripción"
        // }),
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
        // columnHelper.accessor("customSerialNumber", {
        //     id: 'customSerialNumber',
        //     cell: (info) => {
        //         const customSerialNumber = info.getValue()
        //         const instrument = info.row.original as IInstrument;
        //         if(customSerialNumber) return customSerialNumber
        //         return instrument.serialNumber
        //     },
        //     header: "Numero de serie alternativo"
        // }),
        // columnHelper.accessor("label", {
        //     id: 'label',
        //     cell: (info) => {
        //         const label = info.getValue()
        //         const instrument = info.row.original as IInstrument;
        //         if(label) return label
        //         return instrument.serialNumber
        //     },
        //     header: "Identificador"
        // }),
        columnHelper.accessor("model", {
            id: 'brand',
            cell: (info) => {
                const model = info.getValue() as unknown as IModel
                return model.brand?.name
            },
            header: "Marca"
        }),
        columnHelper.accessor("model", {
            id:"model",
            // @ts-ignore
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
                const instrument = info.row.original as IInstrument;
                if(!info.getValue()){
                    if(instrument.certificate) return "En calibración"
                    return " Sin fecha "
                }
                return certificateDateFormat(info.getValue())
            },
            header: "Vencimiento",
        }),
        columnHelper.accessor("id", {
            id: 'received',
            cell: (info) => {
                const instrument = info.row.original as IInstrument;
                const isInTheOffice = instrument.calibrationExpirationDate === undefined;
                return <Switch id="toggle-button" colorScheme="teal" isChecked={ isInTheOffice } onChange={(e) => {
                    handleInstrumentReceived(instrument, e.target.checked);
                  }} />
            },
            header: "Recibido",
        }),
        columnHelper.accessor("certificate", {
            id: 'downloadCertificate',
            cell: (info) => {
                
                const instrument = info.row.original as IInstrument;
                
                return <>
                <ITMButton marginLeft={5} template="dark" onClick={() => {
                            setIsModalOpen(true)
                            setEditCertificate(instrument.certificate as ICertificate)
                            setInstrumentSelected(instrument)
                        }}>
                        <ArrowUpIcon />
                    </ITMButton>
                
                { instrument.certificate &&
                    <ITMButton template="dark" onClick={()=> handleDowloadCertificate({certificate: info.getValue() as string}) }>
                        <AiOutlineCloudDownload /> 
                    </ITMButton>
                    
                }
                </>
            },
            header: "Certificado",
        }),
        columnHelper.accessor("id", {
            id: 'openCard',
            cell: (info) => {
                return <ITMButton template="light" onClick={()=> handleOpenCard(info.getValue()) }>
                    <BsEye />
                </ITMButton>
            },
            header: "Ficha Ténica",
        })
    ];

    useEffect(()=>{
        columns && setSelectedColumns( columns.map(c => c.id ?? "" ) )
    },[])

    useEffect(()=>{
        setShowColumns( columns.filter( c => c.id && selectedColumns.includes(c.id) ) )
    },[selectedColumns])
    
    
    const handleClickNewInstrument = (e:React.MouseEvent) => {
        e.preventDefault()
        router.push(RouteNamesEnum.CREATE_UPDATE_INSTRUMENT)
    }

    const handleClickUserList = (e:React.MouseEvent) => {
        e.preventDefault()
        router.push(RouteNamesEnum.ALL_USERS)
    }

    const handleClickCertificateList = (e:React.MouseEvent) => {
        e.preventDefault()
        router.push(RouteNamesEnum.CERTIFICATES_LIST)
    }

    const handleClickBadgetsList = (e:React.MouseEvent) => {
        e.preventDefault()
        router.push(RouteNamesEnum.BADGETS_LIST)
    }
    const handleClickClientList = (e:React.MouseEvent) => {
        e.preventDefault()
        router.push(RouteNamesEnum.ALL_COSTUMERS)
    }

    

  return (
    
    <Box padding='1'>
        <Title title="Listado de Instrumentos"/>
        
        <Flex flexDirection={"row"} gap={5} align={"center"} marginBottom={10} marginTop={5}>
            <ITMButton template="light" onClick={handleClickNewInstrument}>
                <AddIcon marginRight={3} />
                Instrumento
            </ITMButton>

            <ITMButton template="light" onClick={handleClickUserList}>
                <HamburgerIcon marginRight={3} />
                Usuarios
            </ITMButton>

            <ITMButton template="light" onClick={handleClickCertificateList}>
                <HamburgerIcon marginRight={3} />
                Certificados
            </ITMButton>

            <ITMButton template="light" onClick={handleClickBadgetsList}>
                <HamburgerIcon marginRight={3} />
                Presupuestos
            </ITMButton>

            <ITMButton template="light" onClick={handleClickClientList}>
                <HamburgerIcon marginRight={3} />
                Clientes
            </ITMButton>

        </Flex>

        <Card marginBottom={10}>
            <CardBody>
                <Statics instruments={filteredData}/>
            </CardBody>
        </Card>
        
        
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
                    onChange={(e) => setClientFilter(e.target.value)}
                >
                    <option key={"0"} value={"ALL"}>
                        {"Todos los clientes"}
                    </option>
                    {allClients?.map((client, index) => (
                        <option key={client.id} value={client.id}>
                        {client.socialReason}
                        </option>
                    ))}
                </Select>
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
                    {instrumentsType?.sort((a, b) => {
                            return a.type.localeCompare(b.type);
                        }).map((i) => (
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
                
        </Flex>
        
        <WrapperDataTable>
            <DataTable 
                columns={showColumns} 
                data={filteredData} 
                centeredColumns={["Ficha Técnica","Certificado"]}
            />
        </WrapperDataTable>
        

        <CreateOrUpdateCertificateModal
                    instrument={instrumentSelected}
                    certificate={editCertificate}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    setEditCertificate={setEditCertificate}
                />

    </Box>
    
  );
}

export default withAuth(LandingPage, [UserRolesEnum.TECHNICAL, UserRolesEnum.ADMIN]);
import { DeleteCertificateQuery, GetCertificateQuery } from "@/api/query/certificate.query";
import { GetAllClientsQuery } from "@/api/query/client.query";
import { GetInstrumentsTypeQuery } from "@/api/query/instruments-type.query";
import { ICertificate } from "@/api/types/certificate.types";
import { IInstrument } from "@/api/types/instrument.type";
import { IINstrumentType } from "@/api/types/intruments-type.type";
import { IOffice } from "@/api/types/office.type";
import { certificateDateFormat } from "@/commons/dateTimeFunctions";
import { DownloadCertificate } from "@/commons/dowloadCertificate";
import BackButton from "@/components/BackButton";
import ITMButton from "@/components/Button";
import { ColumnDropdown } from "@/components/ColumnDropDown";
import { DataTable } from "@/components/DataTable";
import ConfirmModal from "@/components/Modals/ConfirmModal";
import CreateOrUpdateCertificateModal from "@/components/Modals/CreateOrUpdateCertificateModal";
import SpinnerITM from "@/components/Spinner";
import Title from "@/components/Title";
import WrapperDataTable from "@/components/WrapperDataTable";
import { getTypeInstrumentBadge } from "@/components/instrumentBadge";
import { UserRolesEnum } from "@/const/userRoles.const";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import withAuth from "@/routes/withAuth";
import useStore from "@/store";
import { ArrowDownIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Alert, AlertDescription, AlertIcon, Box, Flex, Input, Select, useToast } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Document } from 'react-pdf';

function CertificateListPage() {
    const toast = useToast()
    const [ params, setParams ] = useState({
        populate:["equipment.office.client", "equipment.instrumentType"]
        
    })
    const { data: allClients} = GetAllClientsQuery()
    const { data: instrumentsType } = GetInstrumentsTypeQuery()
    const { data: CertificationsList, isLoading, refetch: refetchGetCertificateQuery} = GetCertificateQuery({ params });
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [clientFilter, setClientFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<ICertificate[]>([]);
    const columnHelper = createColumnHelper<ICertificate>();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editCertificate, setEditCertificate] = useState<any>();
    const [deleteCertificate, setDeleteCertificate] = useState<ICertificate>();
    const [instrumentSelected, setInstrumentSelected] = useState<IInstrument>()
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumns, setShowColumns] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const store = useStore(); 

    useEffect(()=>{
        refetchGetCertificateQuery()
    },[store.refetch])

    const handleColumnToggle = (updatedColumns: string[]) => {
        setSelectedColumns(updatedColumns);
    };

    const {
        mutate: DeleteCertificateQueryEvent,
        isError: isErrorDeleteCertificate, isSuccess: isDeleteSuccess, error: errorDeleteCerticficate
      } = DeleteCertificateQuery()

      useEffect(()=>{
        if(isDeleteSuccess){
            refetchGetCertificateQuery()
            setIsDeleteModalOpen(false)
            toast({
                title: 'El certificado fue borrado.',
                status: 'success',
                duration: 2000,
                isClosable: true,
            })

        }
        
      },[isDeleteSuccess])

      useEffect(()=>{
        if(isErrorDeleteCertificate){
            const thisError = (errorDeleteCerticficate as any).response.data.error.errorCode
            if( thisError === 1024){

                toast({
                    title: 'No se pudo borrar el certificado.',
                    description: "El certificado esta asignado a un equipo. Primero reemplace el certificado actual y luego vuelva a intentar borrarlo.",
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  })
            }
        }
      },[isErrorDeleteCertificate])

    useEffect(()=>{
        columns && setSelectedColumns( columns.map(c => c.id ?? "" ) )
    },[])
    
    useEffect(()=>{
        setShowColumns( columns.filter( c => c.id && selectedColumns.includes(c.id) ) )
    },[selectedColumns])

    useEffect(() => {
        let filtered = CertificationsList || [];
        if (search !== "") {
            filtered = filtered.filter(item => item.number?.includes(search));
        }

        if (typeFilter !== "ALL") {
            filtered = filtered.filter(item => (
                (item.equipment as IInstrument)?.instrumentType as IINstrumentType)?.id === typeFilter);
        }

        if (clientFilter !== "ALL") {
            filtered = filtered.filter(item => ((item.equipment as IInstrument)?.office as IOffice)?.client?.id === clientFilter);
        }
    
        setFilteredData(filtered);
    }, [search, CertificationsList, typeFilter, clientFilter]);
    
    const handleDowloadCertificate = ({certificate}:{certificate:string}) => {
        certificate && DownloadCertificate({certificate})
    }

    const handleDeleteCertificate = (certificateToDlete:ICertificate) => {
        setIsDeleteModalOpen(true)
        setDeleteCertificate(certificateToDlete)
    }

    const handleConfirmDeleteCertificate = () => {
        setIsDeleteModalOpen(false)
        deleteCertificate && DeleteCertificateQueryEvent(deleteCertificate)
    }
    
    const columns = [
        //@ts-ignore
        columnHelper.accessor("number", {
            id: "number",
            cell: (info) => {
                return info.getValue() || "Sin numero"
            },
            header: "Numero de certificado"
        }),
        columnHelper.accessor("equipment", {
            id: "equipment",
            cell: (info) => {
                const instrument = info.getValue() as IInstrument
                return (instrument?.instrumentType as IINstrumentType)?.type || "Sin instrumento"
            },
            header: "Tipo de instrumento"
        }),
        columnHelper.accessor("calibrationDate", {
            id: "calibrationDate",
            cell: (info) => {
                return info.getValue() ? certificateDateFormat(info.getValue()) : "Sin fecha"
            },
            header: "Fecha de calibración"
        }),
        columnHelper.accessor("calibrationExpirationDate", {
            id: "calibrationExpirationDate",
            cell: (info) => info.getValue() ? certificateDateFormat(info.getValue()) : "Sin fecha",
            header: "Fecha de vencimiento"
        }),
        columnHelper.accessor("calibrationExpirationDate", {
            id: 'state',
            cell: (info) => {
                return getTypeInstrumentBadge(info.getValue()) 
            },
            header: "Estado",
        }),
        columnHelper.accessor("createdAt", {
            id: "createdAt",
            cell: (info) => certificateDateFormat(info.getValue()),
            header: "Fecha de creación"
        }),
        columnHelper.accessor("updatedAt", {
            id: "updatedAt",
            cell: (info) => certificateDateFormat(info.getValue()),
            header: "Fecha de actualización"
        }),
        columnHelper.accessor("equipment", {
            id: 'client',
            cell: (info) => {
                const instrument = info.getValue() as IInstrument
                return (instrument?.office as IOffice)?.client?.socialReason ?? "Sin cliente"
            }, 
            header: "Cliente"
        }),
        columnHelper.accessor("certificate", {
            id: 'downloadCertificate',
            cell: (info) => {
                const raw = info.row.original as ICertificate;
                const certificate = info.getValue() as string
                const instrument = raw.equipment as IInstrument
                
                return <Flex align="center" justify="center">
                
                <ITMButton marginLeft={5} template="dark" onClick={() => {
                            setIsModalOpen(true)
                            setEditCertificate(raw)
                            setInstrumentSelected(instrument)
                        }}>
                        <EditIcon />
                    </ITMButton>
                
                { certificate &&
                    <ITMButton template="dark" onClick={()=> certificate && handleDowloadCertificate({certificate}) }>
                        <ArrowDownIcon />
                    </ITMButton>
                    
                }

                
                <ITMButton template="warning" onClick={()=> handleDeleteCertificate(raw) }>
                    <DeleteIcon />
                </ITMButton>
                    
                

                </Flex>
            },
            header: "Certificado",
        }),
    ];
    

  return (
    <>
    <Box padding='1'>
        <Flex 
                flexDirection={"row"} 
                gap={5} 
                align={"left"}
                justifyContent={"center"}
                verticalAlign={"center"}
                key={"title"}
            >
                <BackButton fixedRoute={RouteNamesEnum.TECHNICAL_LANDING}/>
                <Title title="Listado de Certificados en el sistema"/>
            </Flex>
        
        
        <Flex flexDirection={"row"} gap={5} align={"center"}>
            <span className="text-itm font-semibold py-3">Filtrar: </span>
                <Input
                    placeholder='Buscar número de certificado'
                    htmlSize={25}
                    width='auto'
                    onChange={e => setSearch(e.target.value)}
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
        {
            isLoading ? <SpinnerITM/> : 
                <WrapperDataTable>
                    <DataTable columns={showColumns}  data={filteredData}/>
                </WrapperDataTable>
        }
        <CreateOrUpdateCertificateModal
            instrument={instrumentSelected}
            certificate={editCertificate}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            setEditCertificate={setEditCertificate}
        />
    </Box>
        <ConfirmModal 
            title="¿Confirmar que desea borrar el certificado?"
            isModalOpen={isDeleteModalOpen}
            setIsModalOpen={setIsDeleteModalOpen}
            confirmCallbackModal={ handleConfirmDeleteCertificate }
            body={
                <Box>
                    <Box>
                        <Alert status='error'>
                            <AlertIcon />
                            <AlertDescription>Vas a borrar el certificado del sistema.</AlertDescription>
                        </Alert>
                        <br></br>
                        
                    </Box>
                    <Box>
                        {deleteCertificate?.number && (`Certificado número: ${deleteCertificate?.number}`)} 
                        {deleteCertificate?.certificate && <Document file={deleteCertificate?.certificate as string}/>} 
                    </Box>
                </Box>
            }
        />
    </>
    )
}

export default withAuth(CertificateListPage, [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL]);
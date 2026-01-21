import { GetAllClientsQuery } from "@/api/query/client.query";
import { ICity } from "@/api/types/city.types";
import { IClient } from "@/api/types/client.type";
import { Params } from "@/commons/params.interfaces";
import BackButton from "@/components/BackButton";
import ITMButton from "@/components/Button";
import { DataTable } from "@/components/DataTable";
import CreateOrUpdateCostumerModal from "@/components/Modals/CreateOrUpdateCostumerModal";
import CreateOrUpdateOfficeModal from "@/components/Modals/CreateOrUpdateOfficeModal";
import CreateOrUpdateUserModal from "@/components/Modals/CreateOrUpdateUserModal";
import OfficeListModal from "@/components/Modals/OfficeListModal";
import SpinnerITM from "@/components/Spinner";
import Title from "@/components/Title";
import WrapperDataTable from "@/components/WrapperDataTable";
import { UserRolesEnum } from "@/const/userRoles.const";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import withAuth from "@/routes/withAuth";
import useStore from "@/store";
import { AddIcon, EditIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Box, Flex, Input } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const params:Params = {
    populate: ["city"]
}

function CostumersListPage() {
    const store = useStore();
    const [ isCostumerModalOpen, setIsCostumerModalOpen ] = useState<boolean>(false)
    const [ isOfficeModalOpen, setIsOfficeModalOpen ] = useState<boolean>(false)
    const [ isUserModalOpen, setIsUserModalOpen ] = useState<boolean>(false)
    const [ isEditCosumerModalOpen, setIsEditCosumerModalOpen ] = useState<boolean>(false)
    
    const [ isOfficeListModalOpen, setIsOfficeListModalOpen ] = useState<boolean>(false)
    const [ client, setClient ] = useState<string>()
    const [ clientOffice, setClientOffice ] = useState<string>()
    const [ editCosumer, setEditCosumer ] = useState<IClient>()
    
    const { data: allClients, isLoading, refetch: refetchAllClients} = GetAllClientsQuery({params})
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<IClient[]>([]);
    const columnHelper = createColumnHelper<IClient>();
    
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumns, setShowColumns] = useState<any[]>([]);

    useEffect(()=>{
        columns && setSelectedColumns( columns.map(c => c.id ?? "" ) )
    },[])

    useEffect(()=>{
        store.refechUserList && refetchAllClients()
    },[store.refechUserList])

    useEffect(()=>{
        setShowColumns( columns.filter( c => c.id && selectedColumns.includes(c.id) ) )
    },[selectedColumns])

    const handleAddOffice = ({client}:{client:string}) => {
        setClient(client)
        setIsOfficeModalOpen(true)
    }

    const handleListOffice = ({client}:{client:string}) => {
        setClientOffice(client)
        setIsOfficeListModalOpen(true)
    }

    const handleEditCostumer = ({costumer}:{costumer:IClient}) => {
        setEditCosumer(costumer)
        setIsEditCosumerModalOpen(true)
    }

    useEffect(() => {
        
        let filtered = allClients || [];

        if (search !== "") {
            const substringLower = search.toLowerCase();

            filtered = filtered.filter((client) => {
                const cuitLower = client.cuit.toLowerCase();
                const razonSocialLower = client.socialReason.toLowerCase();
                return (
                    cuitLower.includes(substringLower) || razonSocialLower.includes(substringLower)
                );
            });
          }
        setFilteredData(filtered.reverse());
      }, [ search, allClients]);



    const columns = [
        columnHelper.accessor("cuit", {
            id: "cuit",
            cell: (info) => {
                return info.getValue() 
            },
            header: "CUIT"
        }),
        columnHelper.accessor("socialReason", {
            id: "socialReason",
            cell: (info) => {
                return info.getValue() 
            },
            header: "Razón Social"
        }),
        columnHelper.accessor("city", {
            id: "city",
            cell: (info) => {
                const city = info.getValue() as any as ICity
                return city.name
            },
            header: "Ciudad"
        }),
        columnHelper.accessor("responsable", {
            id: "responsable",
            cell: (info) => {
                return info.getValue() 
            },
            header: "Responsable"
        }),
        columnHelper.accessor("id", {
            id: "id",
            cell: (info) => (
                <Flex justifyContent="space-between">
                  <ITMButton
                    template="light"
                    onClick={() => handleAddOffice({client: info.getValue()})}
                  >
                    <AddIcon/>
                  </ITMButton>
        
                  <ITMButton
                    template="light"
                    onClick={() => handleListOffice({client: info.getValue()})}
                  >
                    <HamburgerIcon/>
                  </ITMButton>
                </Flex>
              ),
            header: "Sucursales"
        }),
        columnHelper.accessor("id", {
            id: "edit",
            cell: (info) => {
                const costumer = info.row.original as IClient;
                return <Flex justifyContent="space-between">
                  <ITMButton
                    template="light"
                    onClick={ () => handleEditCostumer({costumer}) }
                  >
                    <EditIcon/>
                  </ITMButton>
                </Flex>
            },
            header: "Editar"
        }),
    ];

  return (
    
    <Box padding='1'>
        <Flex 
            flexDirection={"row"} 
            gap={5} 
            align={"left"}
            justifyContent={"center"}
            verticalAlign={"center"}
            key={"title"}
        >
            <BackButton fixedRoute={RouteNamesEnum.ALL_COSTUMERS}/>
            <Title title="Clientes"/>
        </Flex>
        
        <Flex flexDirection={"row"} gap={5} align={"center"}>
            <span className="text-itm font-semibold py-3">Filtrar: </span>
                <Input
                    placeholder='Buscar CUIT or Razón social'
                    htmlSize={25}
                    width='auto'
                    onChange={e => setSearch(e.target.value)}
                />
                 <CreateOrUpdateCostumerModal
                    isModalOpen={isCostumerModalOpen}
                    setIsModalOpen={setIsCostumerModalOpen}
                />
                <CreateOrUpdateUserModal
                    isModalOpen={isUserModalOpen}
                    setIsModalOpen={setIsUserModalOpen}
                />
        </Flex>
        

        {
            isLoading ? <SpinnerITM/> :<WrapperDataTable><DataTable columns={showColumns} data={filteredData || []}/></WrapperDataTable>
        }

        { client && <CreateOrUpdateOfficeModal
            isModalOpen={isOfficeModalOpen}
            setIsModalOpen={setIsOfficeModalOpen}
            client={client}
        /> }

        { clientOffice && <OfficeListModal
            isModalOpen={isOfficeListModalOpen}
            setIsModalOpen={setIsOfficeListModalOpen}
            client={clientOffice}
        /> }

        { <CreateOrUpdateCostumerModal
            isModalOpen={isEditCosumerModalOpen}
            setIsModalOpen={setIsEditCosumerModalOpen}
            costumer={editCosumer}
        />}
        
    </Box>
    )
}

export default withAuth(CostumersListPage, [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL]);
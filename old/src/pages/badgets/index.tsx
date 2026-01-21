import { GetBadgetsQuery } from "@/api/query/badgets.query";
import { GetAllClientsQuery } from "@/api/query/client.query";
import { IBadget } from "@/api/types/badgets.type";
import { IOffice } from "@/api/types/office.type";
import { IUser } from "@/api/types/user.types";
import AdvancedSearch from "@/components/AdvanceSearch";
import BackButton from "@/components/BackButton";
import ITMButton from "@/components/Button";
import ButtonDowloadBadget from "@/components/ButtonDowloadBadget";
import { ColumnDropdown } from "@/components/ColumnDropDown";
import { DataTable } from "@/components/DataTable";
import SpinnerITM from "@/components/Spinner";
import Title from "@/components/Title";
import WrapperDataTable from "@/components/WrapperDataTable";
import { BadgetTypeENUM } from "@/const/badget.const";
import { UserRolesEnum } from "@/const/userRoles.const";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import withAuth from "@/routes/withAuth";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Flex, Input, Select } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";


function BadgetsListPage() {
    const [ params, setParams ] = useState({
        populate: ['office.client', "advisor"],
        select: ["number", "year", "reference", "types", "advisor", "date"],
        limit: 50,        
    })
    const { push } = useRouter();
    const { data: allClients } = GetAllClientsQuery()
    const { data: BadgetList, isLoading, refetch} = GetBadgetsQuery({ params });
    const [clientFilter, setClientFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState<BadgetTypeENUM[]| string>("ALL");
    
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<IBadget[]>([]);
    const [editBadget, setEditBadget] = useState<IBadget>();
    const columnHelper = createColumnHelper<IBadget>();
    
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumns, setShowColumns] = useState<any[]>([]);
    
    const handleColumnToggle = (updatedColumns: string[]) => {
        setSelectedColumns(updatedColumns);
    };

    useEffect(()=>{
        columns && setSelectedColumns( columns.map(c => c.id ?? "" ) )
    },[])

    useEffect(()=>{
        setShowColumns( columns.filter( c => c.id && selectedColumns.includes(c.id) ) )
    },[selectedColumns])

    useEffect(() => {
        let filtered = BadgetList || [];
        
        if (search !== "") {
            const searchNumber = search.toString(); // Convierte la búsqueda a cadena
            filtered = filtered.filter(item => item.number?.toString().includes(searchNumber));
          }
      
        if (clientFilter !== "ALL") {
          filtered = filtered.filter(item => (item.office as IOffice)?.client?.id === clientFilter);
        }
        if (typeFilter !== "ALL") {
            //@ts-ignore
            filtered = filtered.filter((item) => item.types?.includes(typeFilter));
          }
        setFilteredData(filtered.reverse());
      }, [clientFilter, typeFilter, search, BadgetList]);
    

    const columns = [
        columnHelper.accessor("number", {
            id: "number",
            cell: (info) => {
                return info.getValue() 
            },
            header: "Número"
        }),
        columnHelper.accessor("types", {
            id: "types",
            cell: (info) => {
                const types = info.getValue() 
                return types?.join(", ")

            },
            header: "Tipo de presupuesto"
        }),
        columnHelper.accessor("office", {
            id: "client",
            cell: (info) => {
                const office = info.getValue() as unknown as IOffice
                const client = office?.client?.socialReason
                return client || "Sin cliente"
            },
            header: "Cliente"
        }),
        columnHelper.accessor("office", {
            id: "office",
            cell: (info) => {
                const office = info.getValue() as unknown as IOffice
                const client = office?.name
                return client || "Sin sucursal"
            },
            header: "Sucursal"
        }),
        columnHelper.accessor("reference", {
            id: "reference",
            cell: (info) => {
                return info.getValue() 
            },
            header: "Ref"
        }),
        columnHelper.accessor("advisor", {
            id: "advisor",
            cell: (info) => {
                const advisor = info.getValue() as IUser
                return `${advisor.name}, ${advisor.lastName}`
            },
            header: "Asesor"
        }),
        columnHelper.accessor("date", {
            id: "date",
            cell: (info) => {
                const date = new Date(info.getValue());
                const day = date.getUTCDate();
                const month = date.getUTCMonth() + 1; // Sumamos 1 porque los meses van de 0 a 11
                const year = date.getUTCFullYear();
                return `${day}/${month}/${year}`;
            },
            header: "Fecha"
        }),
        columnHelper.accessor("number", {
            id: "edit",
            cell: (info) => {
              const badget = info.row.original as IBadget;
              return (
                
                <Flex justifyContent="space-between" alignItems="center">
                    <ITMButton
                        template="light"
                        marginRight={3}
                        onClick={() => {
                            setEditBadget(badget)
                        }}
                    >
                        <EditIcon/>
                    </ITMButton>
                        
                    <ButtonDowloadBadget badget={badget}/>

                </Flex>
                
                
              );
            },
            header: "Acciones",
          }),
    ];

    const handleNewBadget = () => {
        push(`${RouteNamesEnum.CREATE_UPDATE_BADGET}`);
    }

    useMemo(()=>{
        editBadget && push(`${RouteNamesEnum.CREATE_UPDATE_BADGET}?number=${editBadget?.number}`);
    },[editBadget])
    

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
                <BackButton fixedRoute={RouteNamesEnum.TECHNICAL_LANDING}/>
                <Title title="Presupuestos"/>
            </Flex>
        
        <AdvancedSearch setParams={setParams} params={params} isLoading={isLoading}/>

        <Flex flexDirection={"row"} gap={5} align={"center"}>
            <span className="text-itm font-semibold py-3">Filtrar: </span>
                <Input
                    placeholder='Buscar número'
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
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option key={"ALL"} value={"ALL"}>
                        {"Todos los tipos"}
                    </option>
                    {Object.values(BadgetTypeENUM).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </Select>

                <ColumnDropdown
                    columns={columns}
                    selectedColumns={selectedColumns}
                    onColumnToggle={handleColumnToggle}
                />

            <ITMButton template="light" onClick={handleNewBadget}>
                <AddIcon marginRight={3} />
                { "Presupuesto"}
            </ITMButton>

        </Flex>
        
        

        {
            isLoading ? <SpinnerITM/> :<WrapperDataTable><DataTable columns={showColumns} data={filteredData}/></WrapperDataTable>
        }
        
    </Box>
    )
}

export default withAuth(BadgetsListPage, [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL]);
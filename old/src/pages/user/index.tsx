import { GetUsersQuery } from "@/api/query/auth.query";
import { GetAllClientsQuery } from "@/api/query/client.query";
import { IOffice } from "@/api/types/office.type";
import { IUser } from "@/api/types/user.types";
import { dateTimeForLastLogin } from "@/commons/dateTimeFunctions";
import BackButton from "@/components/BackButton";
import ITMButton from "@/components/Button";
import { ColumnDropdown } from "@/components/ColumnDropDown";
import { DataTable } from "@/components/DataTable";
import CreateOrUpdateUserModal from "@/components/Modals/CreateOrUpdateUserModal";
import SpinnerITM from "@/components/Spinner";
import Title from "@/components/Title";
import WrapperDataTable from "@/components/WrapperDataTable";
import { UserRolesEnum } from "@/const/userRoles.const";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import withAuth from "@/routes/withAuth";
import useStore from "@/store";
import { EditIcon } from "@chakra-ui/icons";
import { Box, Flex, Input, Select } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";


function UserListPage() {
    const [ params, setParams ] = useState({
        populate: ['office.client'],
        select: ["name", "email", "lastName","area", "phoneNumber", "roles", "lastLogin"]
    })
    const { data: allClients } = GetAllClientsQuery()
    const { data: UserList, isLoading, refetch} = GetUsersQuery({ params });
    const [clientFilter, setClientFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<IUser[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<IUser>();
    const columnHelper = createColumnHelper<IUser>();
    const store = useStore();
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

    useEffect(()=>{
        refetch()
    },[store.refechUserList])

    useEffect(() => {
        let filtered = UserList || [];
        if (search !== "") {
            filtered = filtered.filter(item => item.email.includes(search));
        }
    
        if (clientFilter !== "ALL") {
            filtered = filtered.filter(item => (item.office as IOffice)?.client?.id === clientFilter);
        }
        setFilteredData(filtered.reverse());
    }, [clientFilter, search, UserList]);
    

    const columns = [
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
        columnHelper.accessor("area", {
            id: "area",
            cell: (info) => {
                const area = info.getValue()
                return area || "Sin area"
            },
            header: "Area"
        }),
        columnHelper.accessor("name", {
            id: "name",
            cell: (info) => info.getValue(),
            header: "Nombre"
        }),
        columnHelper.accessor("lastName", {
            id: "lastName",
            cell: (info) => info.getValue(),
            header: "Apellido"
        }),
        columnHelper.accessor("email", {
            id: "email",
            cell: (info) => info.getValue(),
            header: "Email"
        }),
        
        columnHelper.accessor("phoneNumber", {
            id: "phoneNumber",
            cell: (info) => info.getValue(),
            header: "Telefono"
        }),
        columnHelper.accessor("roles", {
            id: "roles",
            cell: (info) => info.getValue(),
            header: "Rol",
        }),
        columnHelper.accessor("lastLogin", {
            id: "lastLogin",
            cell: (info) => info.getValue() ? dateTimeForLastLogin(info.getValue()!) : "Todavía no inició sesión",
            header: "Última sesión",
        }),
        columnHelper.accessor("id", {
            id: "id",
            cell: (info) => {
              const user = info.row.original as IUser;
              return (
                <ITMButton
                    template="light"
                    onClick={() => {
                        setIsModalOpen(true)
                        setEditUser(user)
                    }}
                >
                  <EditIcon/>
                </ITMButton>
              );
            },
            header: "Editar",
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
                <BackButton fixedRoute={RouteNamesEnum.TECHNICAL_LANDING}/>
                <Title title="Listado de Usuarios del sistema"/>
            </Flex>
        
        
        <Flex flexDirection={"row"} gap={5} align={"center"}>
            <span className="text-itm font-semibold py-3">Filtrar: </span>
                <Input
                    placeholder='Buscar email'
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

                <ColumnDropdown
                    columns={columns}
                    selectedColumns={selectedColumns}
                    onColumnToggle={handleColumnToggle}
                />

                <CreateOrUpdateUserModal
                    user={editUser}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    setEditUser={setEditUser}
                />
                
        </Flex>
        {
            isLoading ? <SpinnerITM/> :<WrapperDataTable><DataTable columns={showColumns} data={filteredData}/></WrapperDataTable>
        }
        
    </Box>
    )
}

export default withAuth(UserListPage, [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL]);
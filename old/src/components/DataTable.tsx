import { POP_OVER_CONTENT } from "@/const/popOver.const";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Box, Flex, Input as InputCrakra, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import * as React from "react";
import { ItmPopover } from "./popOver";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  centeredColumns?: string[],
  editableColumns?:string[]
  cbEditableColumns?: (id:string,value:string, header:string) => void
};

const defaultPageSize = 5

export function DataTable<Data extends object>({
  data,
  columns,
  centeredColumns,
  editableColumns,
  cbEditableColumns
}: DataTableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,    
    state: {
      sorting
    }
  });

  const getHeaderIcon = (headerTitle: string) => {
    switch (headerTitle.toLowerCase()) {
      case "identificador":
        return <ItmPopover content={POP_OVER_CONTENT.headerTableIdentificador} />;
      case "n/s alternativo":
          return <ItmPopover content={POP_OVER_CONTENT.headerTableAlternativeSerialNumber} />;
      default:
        return null;
    }
  };

  const handleUpdateValue = (newValue: string, cell:any) => {
    const id = cell.row.original.id
    const header = cell.column.id
    const value = newValue

    const previousValue = typeof cell.column.columnDef.cell === 'function' ? cell.column.columnDef.cell(cell.getContext()) : cell.column.columnDef.cell;
    
    if (previousValue !== newValue) {
      cbEditableColumns ? cbEditableColumns(id, value, header) : console.warn("No callback function")
    }
  };

  const Pagination = () => {
    const rows = table.getRowModel().rows.length
    return <div className="flex items-center gap-2 py-3 justify-between">
        <button
          className="border rounded p-2 bg-itm text-white"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'Primera página'}
        </button>
        <button
          className="border rounded p-2 bg-itm text-white"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-2 bg-itm text-white"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-2 bg-itm text-white"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'Última página'}
        </button>
        <span className="flex items-center gap-1">
          <div>Página</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          Ir a la página:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-8"
          />
        </span>
        <select
          className="p-2 bg-itm text-white rounded"
          defaultValue={defaultPageSize}
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[5, 10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Mostrar equipos por página {pageSize}
            </option>
          ))}
        </select>
      </div>
  }

  return ( <>
    <Table>
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: any = header.column.columnDef.meta;
              return (
                <Th
                  key={header.id}
                  isNumeric={meta?.isNumeric}
                  textAlign={"center"}
                  fontWeight={"bold"}
                  color={"black"}
                  fontSize={13}
                  flex={"row"}
                >
                  <Flex  justifyContent={"center"} align={"center"}>
                      <Box onClick={header.column.getToggleSortingHandler()}>
                        {flexRender( header.column.columnDef.header, header.getContext() )}
                        { header.column.getIsSorted() ?
                            <Box pl="4">
                            {header.column.getIsSorted() ? (
                              header.column.getIsSorted() === "desc" ? (
                                <TriangleDownIcon aria-label="sorted descending" />
                              ) : (
                                <TriangleUpIcon aria-label="sorted ascending" />
                              )
                            ) : null}
                            </Box>  : ''
                        }
                      </Box>

                      <Box> 
                          {getHeaderIcon(header.column.columnDef.header as string)}
                      </Box>

                  </Flex>
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              
              const isEditable = editableColumns?.includes(cell.column.columnDef.header as string);

              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: any = cell.column.columnDef.meta;
              return (
                <Td 
                  key={cell.id} 
                  isNumeric={meta?.isNumeric}
                  textAlign={centeredColumns?.includes(cell.column.columnDef.header as string) ? "center" : "left"} 
                >
                  {isEditable ? 
                    <InputCrakra 
                      defaultValue={
                        typeof cell.column.columnDef.cell === 'function' ? cell.column.columnDef.cell(cell.getContext()) : cell.column.columnDef.cell
                      }
                      onBlur={(e) => handleUpdateValue(e.target.value, cell)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const inputValue = (e.target as HTMLInputElement).value;
                          handleUpdateValue(inputValue, cell)
                        }
                      }}
                    />
                    :
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  }
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>

      { Pagination() }
      
    </>
  );
}
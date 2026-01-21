import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Checkbox, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { useState } from "react";

export function ColumnDropdown({ columns, selectedColumns, onColumnToggle }: { columns: any; selectedColumns: string[]; onColumnToggle: (updatedColumns: string[]) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleToggle = (columnId: string) => {
    const updatedColumns = selectedColumns.includes(columnId)
      ? selectedColumns.filter((id) => id !== columnId)
      : [...selectedColumns, columnId];
    onColumnToggle(updatedColumns);
  };
  
  return (
    <Menu isOpen={isMenuOpen} autoSelect={false}>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        bg={ "white"}
        color={'itm.1000'}
        borderColor={"itm.1000"} 
        borderWidth={1} 
        borderStyle="solid"
        rounded={'md'}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        }}
      >
        Columnas
      </MenuButton>
      <MenuList minWidth="200px">
        {columns.map((column: any) => (
          <MenuItem key={column.id} onClick={() => handleToggle(column.id)}>
            <Checkbox isChecked={selectedColumns.includes(column.id)} onChange={() => {}} />
            <Text ml={2}>{column.header}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

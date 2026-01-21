import { Box, Collapse, FormControl, FormLabel, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa"; // Importa los iconos
import ITMButton from "./Button";
import SpinnerITM from "./Spinner";

type AdvancedSearchProps = {
  setParams: React.Dispatch<React.SetStateAction<any>>;
  params: any; 
  isLoading: boolean
};

export default function AdvancedSearch(props: AdvancedSearchProps) {
  const { setParams, params, isLoading } = props

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const toggleAdvancedSearch = () => {
    setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
  };

  const handleDescriptionSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    const newMatchValue = {
      field: "details.description",
      searchText
    }
    const updatedParams = { ...params, match: newMatchValue }; 
    setParams(updatedParams);
    
  }

  return (
    <Box padding="1">
      {/* Botón de Búsqueda Avanzada con icono */}
      <ITMButton template="light" onClick={toggleAdvancedSearch}>
        Búsqueda Avanzada {isAdvancedSearchOpen ? <FaAngleUp /> : <FaAngleDown />}
      </ITMButton>

      {/* Collapse con estilos personalizados */}
      <Collapse in={isAdvancedSearchOpen} className="border itm-1000 rounded-lg mt-2">
        <Box padding={4}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel fontWeight="semibold" width={"30"} fontSize="sm">Descripción</FormLabel>
            </FormControl>

            <Input 
              placeholder="Contiene en la descripción..." 
              value={params.match?.searchText}
              onChange={handleDescriptionSearch}
              />

          </Stack>
        </Box>

          
        { isLoading && <SpinnerITM marginRight={5} /> }

          
      </Collapse>
    </Box>
  );
}
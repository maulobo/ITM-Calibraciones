import BackButton from "@/components/BackButton";
import FormCreateOrUpdateInstrument from "@/components/Forms/CreateOrUpdateInstrument";
import Title from "@/components/Title";
import { UserRolesEnum } from "@/const/userRoles.const";
import withAuth from "@/routes/withAuth";
import { Box, Flex } from "@chakra-ui/react";


function NewInstrumentPage() {
    return (
        <Box padding='1'>
            <Flex 
                flexDirection={"row"} 
                gap={5} 
                align={"left"}
                justifyContent={"center"}
                verticalAlign={"center"}
            >
                <BackButton/>

                <Title title="Crear Instrumento"/>
            </Flex>

            <FormCreateOrUpdateInstrument/>
            
        </Box>
    )
}
export default withAuth(NewInstrumentPage, [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL]);

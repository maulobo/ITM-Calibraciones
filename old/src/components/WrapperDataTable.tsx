import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}
export default function WrapperDataTable({ children, ...props }: Props) {
    return (<Box
            overflowX="auto"
            maxW="1200px"
            minHeight="400px"
            cursor={"pointer"}
            sx={{
                "&::-webkit-scrollbar": {
                height: "10px",
                backgroundColor: "#fff",
                },
                "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#326699",
                },
            }}
            >
            { children }
        </Box>)

}



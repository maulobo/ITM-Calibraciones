import { GetBadgetsQuery } from "@/api/query/badgets.query";
import { IBadget } from "@/api/types/badgets.type";
import { Params } from "@/commons/params.interfaces";
import BackButton from "@/components/BackButton";
import FormCreateOrUpdateBadget from "@/components/Forms/badget/CreateOrUpdateBadgetForm";
import Title from "@/components/Title";
import { UserRolesEnum } from "@/const/userRoles.const";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import withAuth from "@/routes/withAuth";
import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function BadgetsCreateOrUpdatePage() {
    const [badteTitle, setBadgetTitle] = useState<string>("Nuevo presupuesto")
    const [badget, setBadget ] = useState<IBadget>()
    const [ params, setParams ] = useState<Params>({})
    const router = useRouter();
    const { query } = router;

    const { data, refetch: RefetchGetBadgetQuery } = GetBadgetsQuery({
        enabled: false,
        params
    })

    useEffect(()=>{
        const newParams: Record<string, any> = {};

        for (const key in query) {
            if(key === "number"){
                newParams["find"] = {number: query[key]}
            }
        }

        newParams["populate"] = ["advisor", "office","office.client", "user", "instrumentsRelated", "instrumentsRelated.instrumentType","instrumentsRelated.model","instrumentsRelated.model.brand"]
        
        Object.keys(query).length > 0 && setParams(newParams)
        
    }, [ query ])

    useEffect(()=>{
        Object.keys(params).length > 0 && RefetchGetBadgetQuery()
    },[params])

    useEffect(()=>{
        if(data && data?.length > 0){
            setBadget(data[0])
            setBadgetTitle(`Presupuesto ${data[0].year}-${data[0].number}`)
        }  
    },[data])
    
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
                <Title title={badteTitle}/>
            </Flex>
        
        
        <Flex flexDirection={"row"} gap={5} align={"center"}>
            <FormCreateOrUpdateBadget setBadgetTitle={setBadgetTitle} badget={badget}/>
        </Flex>
    </Box>
    )
}

export default withAuth(BadgetsCreateOrUpdatePage, [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL]);
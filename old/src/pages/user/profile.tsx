import { GetInstrumentQuery } from '@/api/query/instruments.query';
import { GetUserProfileQuery } from '@/api/query/profile.query';
import { IOffice } from '@/api/types/office.type';
import BackButton from '@/components/BackButton';
import FormUpateUserProfile from '@/components/Forms/UpdateUserProfile';
import UserAvatar from '@/components/UserAvatar';
import {
  Box,
  Center,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import ExportedImage from 'next-image-export-optimizer';
import backGround from "/public/background.jpeg";

  export default function UserProfilePage() {
    const {data: userProfile, isFetching} = GetUserProfileQuery()
    const { data: instruments } = GetInstrumentQuery()
    
    return (
      <Center minWidth={500}>
        <BackButton/>
        <Box
          w={'full'}
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow={'2xl'}
          rounded={'md'}
          overflow={'hidden'}
          marginLeft={25}
          >
          
          <ExportedImage
            src={backGround}
            alt="Profile background ITM"
            placeholder="blur"
            className='w-full max-h-15 object-cover object-center'
          />
          
          <Flex justify={'center'} mt={-12}>
            <UserAvatar size={"xl"}/>
          </Flex>
  
          <Box p={6}>
            <Stack spacing={0} align={'center'} mb={5}>
              <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
                {userProfile?.name} {userProfile?.lastName}
              </Heading>
              <Text fontSize={"12"} color={'gray.500'}>{userProfile?.email}</Text>
              
              <br/>
              <Text color={'gray.500'}>{(userProfile?.office as IOffice)?.client?.socialReason}</Text>
              <Text color={'gray.500'}>{(userProfile?.office as IOffice)?.name}</Text>
              <Text color={'gray.500'}>{userProfile?.area}</Text>
              <Text fontSize={"10"} color={'gray.500'}>Tel: {userProfile?.phoneNumber}</Text>
              <Text fontSize={"10"} color={'gray.500'}>{(userProfile?.office as IOffice)?.city.name}</Text>
              <Text fontSize={"10"} color={'gray.500'}>Dir: {(userProfile?.office as IOffice)?.adress}</Text>
            </Stack>

            <Stack direction={'row'} justify={'center'} spacing={6} marginBottom={10}>
              <Stack spacing={0} align={'center'}>
                <Text fontSize={"40"} fontWeight={600} color={'itm.1000'}>{instruments?.length}</Text>
                <Text fontSize={"m"} color={'itm.1000'}>
                { instruments && instruments.length > 0 ? "Instrumento":"Instrumentos" }
                </Text>
              </Stack>
            </Stack>

            { userProfile && <FormUpateUserProfile/> }
            
          </Box>
        </Box>
      </Center>
    );
  }
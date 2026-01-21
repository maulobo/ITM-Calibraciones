import { RouteNamesEnum } from "@/routes/routeNames.const";
import useStore from "@/store";
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue
} from '@chakra-ui/react';
import router, { useRouter } from "next/router";
import { ReactNode } from 'react';
import LogoITM from './Logo';
import UserAvatar from "./UserAvatar";

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    bg={"itm.1000"}
    color={'white'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}>
    {children}
  </Link>
);

export default function Navbar() {
  const { push } = useRouter();
  const store = useStore();
  
  const handleLogout = () => {
    store.reset();
    setTimeout(function () {
      push(`${RouteNamesEnum.LOGIN}`);
    }, 500)
    
  };

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>

          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <LogoITM />
            </Box>
          </HStack>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <UserAvatar size={"sm"}/>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={()=>{ router.push(RouteNamesEnum.USER_PROFILE)  }}>
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesion</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
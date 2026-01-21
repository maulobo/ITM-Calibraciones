'use client'
import LoginForm from '@/components/Forms/LoginForm';
import RecoverPasswordForm from '@/components/Forms/RecoverPasswordForm';
import LogoITM from '@/components/Logo';
import { Alert, AlertIcon, Box, Stack } from '@chakra-ui/react';

import {
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { useState } from 'react';

export default function LoginPage() {
    const [showRecoverPassword, setShowRecoverPassword] = useState<boolean>(false)
    const [recoverPassword, setRecoverPassword] = useState<boolean>(false)
    return (
      <Flex
        minH={'50vh'}
        align={'center'}
        justify={'center'}
        rounded={'lg'}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={10} px={6}>
          <Stack align={'center'}>
            <LogoITM maxWidth={"max-w-50p"}/>
            
          </Stack>
          <Box
            rounded={'lg'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'lg'}
            p={8}>
            <Stack spacing={4}>
            { showRecoverPassword ? 
              <RecoverPasswordForm setRecoverPassword={setRecoverPassword} setShowRecoverPassword={setShowRecoverPassword}/> : <LoginForm setShowRecoverPassword={setShowRecoverPassword}/> }
              
              {
                    recoverPassword &&  <Alert status='success'>
                    <AlertIcon />
                     Se envío un correo con una nueva contraseña.
                  </Alert> 
                  }
            </Stack>
          </Box>
        </Stack>
      </Flex>
    );
  }
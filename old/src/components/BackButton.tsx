import { RouteNamesEnum } from '@/routes/routeNames.const';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { useRouter } from 'next/router';

type BackButtonProps = {
    fixedRoute?: RouteNamesEnum
}
export default function BackButton(props:BackButtonProps) {
    const { fixedRoute } = props
    const router = useRouter();
    const handleBackClick = () => {
        if(fixedRoute) router.push(fixedRoute)
        router.back();
    }
    
    return (
        <IconButton
            aria-label="Regresar"
            icon={<ArrowBackIcon />}
            onClick={handleBackClick}
        />
    );
}
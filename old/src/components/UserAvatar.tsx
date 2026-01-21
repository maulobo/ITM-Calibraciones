import useStore from '@/store';
import {
    Avatar
} from '@chakra-ui/react';

export default function UserAvatar({ ...props }) {
    const store = useStore();
    const name = store.authUser?.name || "";
    const lastName = store.authUser?.lastName || "";
    
    return (
        <Avatar 
            name={name + lastName}
            bgColor={"#326699"}
            color={"#FFF"}
            rounded={"xl"}
            {...props}
        />
    );
}
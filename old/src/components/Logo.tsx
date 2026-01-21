import { UserRolesEnum } from "@/const/userRoles.const";
import { useUserRole } from "@/hooks/userRoleHook";
import { RouteNamesEnum } from "@/routes/routeNames.const";
import ExportedImage from "next-image-export-optimizer";
import { useRouter } from "next/router";
import logo from "/public/itm-logo.png";

type LogoProps = {
    maxWidth?: string,
};

export default function LogoITM({ maxWidth = 'max-w-25p' }: LogoProps) {
    const userRole = useUserRole()
    const { push } = useRouter();
    const admin = userRole && [UserRolesEnum.ADMIN, UserRolesEnum.TECHNICAL].includes(userRole)
    const handleOnClick = () => {
        if(admin){
            push(RouteNamesEnum.TECHNICAL_LANDING);
        }else{
            push(RouteNamesEnum.USER_LANDING);
        }
    }
    return (
        <ExportedImage
            src={logo}
            alt="Logo ITM"
            placeholder="blur"
            className={`${maxWidth} hover:cursor-pointer`}
            onClick={handleOnClick}
            
        />
    );
}
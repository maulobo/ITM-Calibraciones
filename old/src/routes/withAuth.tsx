import { UserRolesEnum } from '@/const/userRoles.const';
import Error401 from '@/pages/401';
import useStore from '@/store';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { RouteNamesEnum } from './routeNames.const';

const DefaultRoutes =  {
  [UserRolesEnum.ADMIN] : RouteNamesEnum.TECHNICAL_LANDING,
  [UserRolesEnum.TECHNICAL] : RouteNamesEnum.TECHNICAL_LANDING,
  [UserRolesEnum.CLIENT] : RouteNamesEnum.USER_LANDING,
}

const withAuth = (Component: React.FC, allowedRole: UserRolesEnum[]) => {
    return (props: any) => {
    // getting the auth state from redux store
    const store = useStore();
    const { isLoggedIn, userRoles } = store
    const router = useRouter();
    // console.log({userRoles, allowedRole})
 
    // using a state to keep track if user is in correct state or path
    const [isValidRoute, setIsValidRoute] = useState(false);
    
    useEffect(() => {
      // first condition is to check if logged in and if on wrong path
      // then route to default route of the particular role user is of
      if(
        isLoggedIn && userRoles && !allowedRole.includes(userRoles)
      ) {
        setIsValidRoute(false);
        router.push(DefaultRoutes[userRoles]);
      }

      // second condition is to check if not logged in and if on wrong path
      // then route to default not authenticated path
      else if (!isLoggedIn) {
        setIsValidRoute(false);
        router.push(RouteNamesEnum.LOGIN);
      }

      // if upper two conditions are not met then the route user is in correct and return the component
      else setIsValidRoute(true);
    }, []);
    //TODO Put a 404 page instead of null
    return isValidRoute ? <Component {...props} /> : <Error401/>;
  };
};

export default withAuth;

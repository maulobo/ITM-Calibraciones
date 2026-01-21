import { RouteNamesEnum } from "@/routes/routeNames.const";
import { Container } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Footer from "./Footer";
import Navbar from "./Navbar";
import backGround from "/public/background.jpeg";

type LayoutProps = {
    children: React.ReactNode,
};

const routeWithouLayour : (RouteNamesEnum | string)[] = [RouteNamesEnum.LOGIN, RouteNamesEnum.ERROR_404]

export default function Layout(props:LayoutProps) {
    const { children } = props
    const route = useRouter()
    
    if(routeWithouLayour.includes(route.route) ) return (
        <Container padding={12} 
        w={"100v"}
        h={"100vh"}
        centerContent 
        bgImage={`url(${backGround})`}
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        // bgColor={"red"}
        >
            {children}
        </Container>
    )
   
    return (
        <div className="flex flex-col min-h-screen">
            <header>
                <Navbar />
            </header>

            <main className="flex-grow">
                <Container maxW='6xl' padding={12} centerContent>
                    {children}
                </Container>
            </main>

            <footer>
                <Footer/>
            </footer>
        </div>
    );
}
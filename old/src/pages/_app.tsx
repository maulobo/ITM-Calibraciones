'use client'
import Layout from '@/components/Layout'
import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from "react-query"
import customTheme from '../../chalra-theme'
const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={customTheme}>
       <Layout>
        { 
        // https://upmostly.com/next-js/effortlessly-manage-data-in-next-js-with-react-query#:~:text=React%20Query%20is%20a%20popular,data%2Ddriven%20applications%20even%20easier.
        }
        <QueryClientProvider client={queryClient}>
            <Head>
            {/* Favicon */}
            <link rel="icon" href="favicon/favicon.ico" />

            {/* Título */}
            <title>ITM Calibraciones S.A.</title>

            {/* Etiquetas Open Graph */}
            <meta property="og:title" content="ITM Calibraciones S.A." />
            <meta property="og:description" content="App para gestionar los certificados de calibración de los instrumentos de control de procesos de tu empresa." />
            <meta property="og:image" content={"itm-logo.png"} />
            <link rel="apple-touch-icon" sizes="57x57" href="favicon/apple-icon-57x57.png"/>
            <link rel="apple-touch-icon" sizes="60x60" href="favicon/apple-icon-60x60.png"/>
            <link rel="apple-touch-icon" sizes="72x72" href="favicon/apple-icon-72x72.png"/>
            <link rel="apple-touch-icon" sizes="76x76" href="favicon/apple-icon-76x76.png"/>
            <link rel="apple-touch-icon" sizes="114x114" href="favicon/apple-icon-114x114.png"/>
            <link rel="apple-touch-icon" sizes="120x120" href="favicon/apple-icon-120x120.png"/>
            <link rel="apple-touch-icon" sizes="144x144" href="favicon/apple-icon-144x144.png"/>
            <link rel="apple-touch-icon" sizes="152x152" href="favicon/apple-icon-152x152.png"/>
            <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-icon-180x180.png"/>
            <link rel="icon" type="image/png" sizes="192x192"  href="favicon/android-icon-192x192.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="96x96" href="favicon/favicon-96x96.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png"/>
            <link rel="manifest" href="favicon/manifest.json"/>
            <meta name="msapplication-TileColor" content="#ffffff"/>
            <meta name="msapplication-TileImage" content="favicon/ms-icon-144x144.png"/>
            <meta name="theme-color" content="#ffffff"></meta>
          </Head>
          <Component {...pageProps} />
        </QueryClientProvider>
      </Layout>
    </ChakraProvider>
  )
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
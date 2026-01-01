// @ts-ignore
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import Background from "@/components/Background";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TNT Tag Info</title>
      </Head>
      <Navbar />
      <Background />
      <Component {...pageProps} />
    </>
  )
}

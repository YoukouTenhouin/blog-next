import "../styles/globals.css";
import "../styles/crt.css";
import "../styles/typebase.sass";
import LangContext, { LangContextProvider } from "../components/langcontext";
import { useState } from "react";

export default function App({ Component, pageProps }) {
  return (
    <LangContextProvider>
      <Component {...pageProps} />
    </LangContextProvider>
  );
}

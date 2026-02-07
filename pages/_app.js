import "../styles/globals.css";
import "../styles/crt.css";
import "../styles/typebase.sass";
import "highlight.js/styles/default.css";
import { LangContextProvider } from "../components/lang_context";

export default function App({ Component, pageProps }) {
  return (
    <LangContextProvider>
      <Component {...pageProps} />
    </LangContextProvider>
  );
}

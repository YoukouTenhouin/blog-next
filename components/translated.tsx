import { FC, useContext } from "react"
import translated, { Translations } from "../lib/translated"
import LangContext from "./langcontext"



const Translated: FC<Translations> = ( translations ) => {
    const { current } = useContext(LangContext)

    return <>{translated(current, translations)}</>
}

export default Translated;
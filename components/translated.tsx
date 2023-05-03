import { FC, useContext } from "react"
import LangContext from "./langcontext"

interface TranslatedProps {
    [key: string]: string
    en: string
    cn?: string
}

const Translated: FC<TranslatedProps> = ( translations ) => {
    const { current } = useContext(LangContext)

    const text = translations[current] || translations["en"]

    return <>{text}</>
}

export default Translated;
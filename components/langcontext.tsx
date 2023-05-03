import { createContext, FC, ReactNode, useEffect, useState } from "react";

type LangsAvaliable = "en" | "cn"

interface LangContextProps {
    current: LangsAvaliable
    setCurrent: (v: LangsAvaliable) => void
}

const LangContext = createContext<LangContextProps>({
    current: "cn",
    setCurrent: () => { }
})

export default LangContext

export const LangContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<LangsAvaliable>("cn")
    useEffect(() => {
        if (!window) {
            return
        }
        const lang = localStorage.getItem("lang")
        if (lang) setLang(lang as LangsAvaliable)
    })

    return (
        <LangContext.Provider
            value={{
                current: lang,
                setCurrent: lang => { localStorage.setItem("lang", lang); setLang(lang); }
            }}
        >{children}</LangContext.Provider>
    )
}
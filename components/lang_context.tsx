import { createContext, FC, ReactNode, useEffect, useState } from "react";

import { LangsAvailable } from '@lib/languages'

interface LangContextProps {
    current: LangsAvailable;
    setCurrent: (v: LangsAvailable) => void;
}

const LangContext = createContext<LangContextProps>({
    current: "zh",
    setCurrent: () => { },
});

const ValidLangs = ["en", "zh"]
const DefaultLang = "zh"

export default LangContext;

export const LangContextProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [lang, setLang] = useState<LangsAvailable>(null);
    useEffect(() => {
        if (!window) {
            return;
        }
        const lang = localStorage.getItem("lang");
        if (!lang || ValidLangs.indexOf(lang) == -1) {
            setLang(DefaultLang)
        } else {
            setLang(lang as LangsAvailable)
        }
    }, []);

    return (
        <LangContext.Provider
            value={{
                current: lang,
                setCurrent: (lang) => {
                    localStorage.setItem("lang", lang);
                    setLang(lang);
                },
            }}
        >
            {lang ? children : <></>}
        </LangContext.Provider>
    );
};

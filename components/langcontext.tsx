import { createContext, FC, ReactNode, useEffect, useState } from "react";

type LangsAvaliable = "en" | "cn";

interface LangContextProps {
  current: LangsAvaliable;
  setCurrent: (v: LangsAvaliable) => void;
}

const LangContext = createContext<LangContextProps>({
  current: "cn",
  setCurrent: () => {},
});

const ValidLangs = ["en", "cn"]
const DefaultLang = "cn"

export default LangContext;

export const LangContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = useState<LangsAvaliable>(null);
  useEffect(() => {
    if (!window) {
      return;
    }
    const lang = localStorage.getItem("lang");
    if (!lang || ValidLangs.indexOf(lang) == -1) {
        setLang(DefaultLang)
    } else {
        setLang(lang as LangsAvaliable)
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

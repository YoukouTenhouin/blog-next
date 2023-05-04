import Link from "next/link";
import { useContext } from "react";
import LangContext from "../components/langcontext";
import Layout from "../components/layout";
import Translated from "../components/translated";
import Window from "../components/window";
import translated from "../lib/translated";

export default function Custom404() {
  const { current: currentLang } = useContext(LangContext);

  return (
    <Layout>
      <Window
        crt
        title={translated(currentLang, {
          en: "ERROR!",
          cn: "出错啦！",
        })}
      >
        <h1>(╯°□°)╯︵ ┻━┻</h1>
        <section>
          <p>
            <Translated en="Page not found." cn="找不到页面。" />
            <Link className="crt-colorsep" href="/">
              <Translated
                en="Let's get back to the home page."
                cn="还是回到远处的主页吧家人们。"
              />
            </Link>
          </p>
        </section>
      </Window>
    </Layout>
  );
}

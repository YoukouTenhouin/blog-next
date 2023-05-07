import Link from "next/link";
import Layout from "../components/layout";
import Translated from "../components/translated";
import Window from "../components/window";

export default function Custom404() {
  return (
    <Layout>
      <Window crt>
        <Window.TitleBar>
          <Window.TitleText colorsep>
            <Translated en="ERROR!" cn="出错啦！" />
          </Window.TitleText>
        </Window.TitleBar>
        <Window.Body>
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
        </Window.Body>
      </Window>
    </Layout>
  );
}

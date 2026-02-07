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
                        <Translated en="ERROR!" zh="出错啦！" jp="エラーが発生しました！" />
                    </Window.TitleText>
                </Window.TitleBar>
                <Window.Body>
                    <h1>(╯°□°)╯︵ ┻━┻</h1>
                    <section>
                        <p>
                            <Translated en="Page not found." zh="找不到页面。" jp="ページが見つかりません。" />
                            <Link className="crt-colorsep" href="/">
                                <Translated
                                    en="Let's get back to the home page."
                                    zh="还是回到远处的主页吧家人们。"
                                    jp="ホームページへ帰ろう。"
                                />
                            </Link>
                        </p>
                    </section>
                </Window.Body>
            </Window>
        </Layout>
    );
}

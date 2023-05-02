import Link from "next/link";
import Layout from "../components/layout";

export default function Custom404() {
    return (
        <Layout>
            <h1>(╯°□°)╯︵ ┻━┻</h1>
            <section>
                <p>Page not found. <Link className="crt-colorsep" href="/">Let's get back to the home page.</Link></p>
            </section>
        </Layout>
    )
}
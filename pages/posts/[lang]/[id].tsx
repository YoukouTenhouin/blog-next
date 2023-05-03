import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../../components/layout";
import { getPostData, listPosts } from "../../../lib/posts";
import styles from '../../../styles/Post.module.css';
import { remark } from 'remark';
import html from 'remark-html';
import Head from "next/head";

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = listPosts().map(p => ({
        params: p
    }))
    return {
        paths,
        fallback: false
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const postData = getPostData(params.id as string, params.lang as string)
    const renderedBody = await remark().use(html).process(postData.content)
    return {
        props: {
                rendered: renderedBody.toString(),
                ...postData
        }
    }
}

export default function Post({ title, date, rendered }) {
    return (
        <>
        <Head>
            <title>{title} - 東亞國中央廣播電臺</title>
        </Head>

        <Layout>
            <h1>{title}</h1>
            <div className={styles.post_info}>
                <span>Published on: {new Date(date).toDateString()}</span>
            </div>
            <div className={styles.post_body} dangerouslySetInnerHTML={{ __html: rendered }} />
        </Layout>
        </>
    )
}
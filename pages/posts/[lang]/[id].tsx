import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../../components/layout";
import { getPostData, listPosts } from "../../../lib/posts";
import styles from "../../../styles/Post.module.css";
import { remark } from "remark";
import html from "remark-html";
import Head from "next/head";
import moment from "moment";
import clsx from "clsx";
import LangButton from "../../../components/langbutton";
import Translated from "../../../components/translated";

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = listPosts().map((p) => ({
    params: p,
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = getPostData(params.id as string, params.lang as string);
  const renderedBody = await remark().use(html).process(postData.content);
  return {
    props: {
      rendered: renderedBody.toString(),
      ...postData,
    },
  };
};

export default function Post({
  id,
  title,
  date,
  lang,
  lang_avaliable,
  rendered,
}) {
  const other_languages = lang_avaliable.filter((l) => l != lang);

  return (
    <>
      <Head>
        <title>{`${title} - 東亞國中央廣播電臺`}</title>
      </Head>

      <Layout>
        <div className={styles.post}>
          <div className={styles.post_info_wrapper}>
            <div className={clsx(styles.post_info)}>
              <div className={styles.post_info_title}>
                <h1>{title}</h1>
              </div>
              <div className={styles.post_info_date}>
                <div>
                  <span
                    className={clsx(styles.post_info_large, "crt-colorsep")}
                  >
                    {moment(date).format("DD")}
                  </span>
                </div>
                <div>
                  <span
                    className={clsx(styles.post_info_small, "crt-colorsep")}
                  >
                    {moment(date).format("YYYY/MM")}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.post_lang}>
              {other_languages.length > 0 ? (
                <>
                  <span>
                    <Translated cn="其他语言:" en="Other languages:" />
                  </span>
                  {other_languages.map((l) => (
                    <div className={styles.post_lang_button} key={l}>
                      <LangButton lang={l} href={`/posts/${l}/${id}`} />
                    </div>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
            <div
              className={styles.post_body}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}

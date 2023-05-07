import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../../components/layout";
import { getPostData, listPosts } from "../../../lib/posts";
import styles from "../../../styles/Post.module.css";
import Head from "next/head";
import moment from "moment";
import clsx from "clsx";
import Translated from "../../../components/translated";
import MDRenderer from "../../../components/mdrenderer";
import localFont from "next/font/local";
import Link from "next/link";

const pixelFont = localFont({ src: "../../../fonts/fusion-pixel.woff2" });

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
  return {
    props: postData,
  };
};

export default function Post({
  id,
  title,
  date,
  lang,
  lang_avaliable,
  content,
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
                    className={clsx(
                      styles.post_info_large,
                      "crt-colorsep",
                      pixelFont.className
                    )}
                  >
                    {moment(date).format("DD")}
                  </span>
                </div>
                <div>
                  <span
                    className={clsx(
                      styles.post_info_small,
                      "crt-colorsep",
                      pixelFont.className
                    )}
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
                      <Link href={`/posts/${l}/${id}`}>{lang}</Link>
                    </div>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
            <div
              className={clsx({
                [styles.post_body]: true,
                [styles.post_body_en]: lang == "en",
                [styles.post_body_cn]: lang == "cn",
              })}
            >
              <MDRenderer content={content} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

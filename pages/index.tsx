import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { listPosts } from "../lib/posts";
import { GetStaticProps } from "next";
import Layout from "../components/layout";
import { FC, useContext, useState } from "react";
import clsx from "clsx";
import moment from "moment";
import LangContext from "../components/langcontext";
import Translated from "../components/translated";

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = listPosts()
    .sort((a, b) => {
      if (Date.parse(a.date) > Date.parse(b.date)) {
        return 1;
      } else if (Date.parse(a.date) < Date.parse(b.date)) {
        return -1;
      } else {
        return a.id.localeCompare(b.id);
      }
    })
    .reverse();

  return {
    props: { posts },
  };
};

interface PostListEntryProps {
  id: string;
  title: string;
  date: string;
  lang: string;
  lang_avaliable: string[];
}

const PostListEntry: FC<PostListEntryProps> = ({
  id,
  title,
  date,
  lang,
  lang_avaliable,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <li
      className={clsx({
        [styles.postlist_entry]: true,
        crt: true,
        "crt-flicker": hover,
        "crt-colorsep": hover,
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.postlist_entry}>
        <div className={styles.postlist_entry_container}>
          <div className={styles.postlist_entry_title}>
            <h2>
              <Link href={`/posts/${lang}/${id}`}>{title}</Link>
            </h2>
          </div>
          <div className={styles.postlist_entry_info}>
            <div className={styles.postlist_entry_info_date}>
              <span>{moment(date).format("YYYY/MM/DD")}</span>
            </div>
            <div className={styles.postlist_entry_info_langs}>
              {lang_avaliable.map((l) => (
                <Link key={l} href={`/posts/${l}/${id}`}>{l == "en" ? "English" : "中文"} </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function Home({ posts }) {
  const { current: currentLanguage } = useContext(LangContext);
  const [showAll, setShowAll] = useState(false);

  const ShowAllSwitch = () => {
    const [hover, setHover] = useState(false);
    return (
      <div className={styles.showall_wrapper}>
        <div
          className={clsx({
            [styles.showall]: true,
            [styles.showall_active]: showAll,
            crt: true,
            "crt-colorsep": hover,
            "crt-flicker": hover,
          })}
          onClick={() => setShowAll(!showAll)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div>
            <span>
              <Translated en="ALL LANGS" cn="所有语言" />
            </span>
          </div>
          <div>
            <span>
              {showAll ? (
                <Translated en="ON" cn="开" />
              ) : (
                <Translated en="OFF" cn="关" />
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>東亞國中央廣播電臺</title>
      </Head>

      <ShowAllSwitch />

      <ul className={styles.postlist}>
        {posts
          .reduce((acc, p) => {
            if (acc.length == 0) return [p];
            const last = acc[acc.length - 1];
            if (last.id == p.id) {
              if (p.lang == currentLanguage) {
                acc[acc.length - 1] = p;
              }
              return acc;
            } else {
              acc.push(p);
              return acc;
            }
          }, [])
          .filter((p) => showAll || p.lang == currentLanguage)
          .map((p) => (
            <PostListEntry key={p.id} {...p} />
          ))}
      </ul>
    </Layout>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { listPosts } from '../lib/posts';
import { GetStaticProps } from 'next';
import Layout from '../components/layout';
import { FC, ReactNode, useState } from 'react';
import clsx from 'clsx';

const currentLang = 'en' // XXX: hardcoded

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = listPosts().sort((a, b) => {
    if (Date.parse(a.date) > Date.parse(b.date)) {
      return 1
    } else if (Date.parse(a.date) < Date.parse(b.date)) {
      return -1
    } else {
      const idOrder = a.id.localeCompare(b.id);
      if (idOrder != 0) {
        return idOrder
      } else {
        if (a.lang == currentLang) {
          return 1;
        } else if (b.lang == currentLang) {
          return -1;
        } else {
          return a.lang.localeCompare(b.lang)
        }
      }
    }
  }).reverse().reduce((acc, post) => {
    if (acc.length == 0) {
      return [post]
    }

    if (acc[acc.length - 1].id == post.id) {
      return acc
    } else {
      acc.push(post)
      return acc
    }
  }, [] as ReturnType<typeof listPosts>)

  return {
    props: { posts }
  }
}

interface PostListEntryProps {
  id: string
  title: string
  date: string
  lang: string
  lang_avaliable: string[]
}

const PostListEntry: FC<PostListEntryProps> = ({ id, title, date, lang, lang_avaliable }) => {
  const [hover, setHover] = useState(false)

  const LangSpan: FC<{ lang: string }> = ({ lang }) => {
    const children = <span className={styles.langspan}>{lang}</span>
    return lang == currentLang ? children : <Link href={`/posts/${lang}/${id}`}>{children}</Link>
  }

  return (
    <li
      className={
        clsx({
          [styles.postlist_entry]: true,
          'crt': true,
          'crt-flicker': hover,
          'crt-colorsep': hover
        })
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.postlist_entry_container}>
        <h2>
          <Link href={`/posts/${lang}/${id}`}>
            {title}
          </Link>
        </h2>
        <div>
          <span>{new Date(date).toDateString()}</span> { lang_avaliable.length > 1 ? <span> Avaliable in: {lang_avaliable.map(l => <LangSpan lang={l} />)}</span> : <></> }
        </div>
      </div>
    </li>
  )
}

export default function Home({ posts }) {
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ul className={styles.postlist}>
        {
          posts.map(p => (
            <PostListEntry key={p.id} {...p} />
          ))
        }
      </ul>
    </Layout>
  )
}

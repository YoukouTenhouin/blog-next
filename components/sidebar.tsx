import Link from "next/link";
import Image from "next/image";
import styles from "./sidebar.module.css";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { FC, ReactNode, useContext, useState } from "react";
import LangSpan from "./langspan";
import LangContext from "./langcontext";
import Translated from "./translated";
import SiteLogo from "./sitelogo";

export default function Sidebar() {
  const NavEntry: FC<{ href: string; children: ReactNode }> = ({
    href,
    children,
  }) => {
    const router = useRouter();
    const active = router.pathname == href;
    const [hover, setHover] = useState(false);
    return (
      <li
        className={clsx({
          [styles.nav_active]: active,
          "crt-colorsep": hover && !active,
          "crt-flicker": hover && !active,
        })}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link href={href}>{children}</Link>
      </li>
    );
  };

  const LangSwitchEntry: FC<{ lang: string }> = ({ lang }) => {
    const { current, setCurrent } = useContext(LangContext);

    return (
      <div
        className={clsx({
          [styles.lang_switch_active]: lang == current,
          [styles.lang_switch_entry]: true
        })}
        onClick={() => setCurrent(lang as any)}
      >
        <LangSpan lang={lang} />
      </div>
    );
  };

  return (
    <div className={`${styles.sidebar_container} crt`}>
      <div className={styles.sidebar}>
        <SiteLogo />
        <div className={styles.lang_switch_wrapper}>
        <div className={styles.lang_switch}>
          <LangSwitchEntry lang="cn" />
          <LangSwitchEntry lang="en" />
        </div>
        </div>

        <div className={styles.profile}>
          <div className={`${styles.profile_image} crt-darkcorner`}>
            <Image
              src="profile.png"
              height={144}
              width={144}
              alt="Youkou Tenhouin"
            />
          </div>
          <span><Translated en="Youkou Tenhouin" cn="天鳳院瑤光" /></span>
        </div>
        <div className={styles.nav}>
          <ul>
            <NavEntry href="/"><Translated en="Home" cn="首页" /></NavEntry>
          </ul>
        </div>
      </div>
    </div>
  );
}

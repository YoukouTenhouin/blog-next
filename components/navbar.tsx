import { FC, ReactNode, useContext, useState } from "react";
import Link from "next/link";
import localFont from "next/font/local";
import { useRouter } from "next/router";
import clsx from "clsx";

import { LangsAvailable } from '@lib/languages'
import LangContext from "./lang_context";
import LangButton from './lang_button'
import { NavMenuShownContext } from "./nav_menu";

import Translated from "./translated";
import SiteLogo from "./sitelogo";
import styles from "./navbar.module.css";


const pixelFont = localFont({ src: "../fonts/fusion-pixel.woff2" });

const NavEntry: FC<{ href: string; children: ReactNode }> = ({
    href,
    children,
}) => {
    const router = useRouter();
    const active = router.pathname == href;
    const [hover, setHover] = useState(false);
    return (
        <div
            className={clsx({
                [styles.nav_button]: true,
                [styles.nav_button_active]: active,
                "crt-colorsep": hover && !active,
                "crt-flicker": hover && !active,
            })}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <Link href={href}>{children}</Link>
        </div>
    );
};

const NavLangButton: FC<{
    lang: LangsAvailable
}> = ({ lang }) => {
    const { current, setCurrent } = useContext(LangContext);
    return (
        <LangButton lang={lang} onClick={() => setCurrent(lang)} active={current == lang} />
    )
}

const NavHamburgerButton: FC = () => {
    const [hover, setHover] = useState(false)
    const { shown, setShown } = useContext(NavMenuShownContext)

    return (
        <div
            className={clsx({
                [styles.nav_hamburger_button]: true,
                [styles.nav_hamburger_button_active]: shown,
                "crt-colorsep": hover && !shown,
                "crt-flicker": hover && !shown,
            })}
            onClick={() => setShown(!shown)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <span>≡</span>
        </div>
    )
}

const Navbar: FC = () => {
    return (
        <div className={styles.navbar_wrapper} >
            <div className={clsx(styles.navbar, pixelFont.className)}>
                <div className={styles.navbar_group}>
                    <div className={styles.lang_switch}>
                        <div className={styles.lang_switch_label}>
                            <Translated en="LANG:" zh="语言：" jp="言語" />
                        </div>
                        <NavLangButton lang="zh" />
                        <NavLangButton lang="en" />
                        <NavLangButton lang="jp" />
                    </div>
                </div>

                <div className={clsx(styles.sitelogo_wrapper, "crt")}>
                    <SiteLogo />
                </div>

                <div className={styles.navbar_group}>
                    <div className={styles.nav_buttons}>
                        <NavEntry href="/">
                            <Translated en="Home" zh="首页" jp="ホーム" />
                        </NavEntry>
                        <NavEntry href="/about">
                            <Translated en="About" zh="关于" jp="概要" />
                        </NavEntry>
                    </div>
                    <NavHamburgerButton />
                </div>
            </div>
        </div >
    );
}

export default Navbar

import { FC, createContext, useContext, useState, ReactNode } from 'react'
import localFont from 'next/font/local'
import { useRouter } from 'next/router'
import Image from 'next/image'
import clsx from 'clsx'

import Translated from './translated'
import LangContext from './lang_context'
import { LangsAvailable, languageToCountryCode } from '@lib/languages'

import styles from './nav_menu.module.css'


interface NavMenuShownContextProps {
    shown: boolean,
    setShown: (v: boolean) => void
}

export const NavMenuShownContext = createContext<NavMenuShownContextProps>({
    shown: false,
    setShown: () => { },
})

const pixelFont = localFont({ src: "../fonts/fusion-pixel.woff2" });

const NavLink: FC<{ href: string, children: ReactNode }> = ({
    href,
    children
}) => {
    const router = useRouter();
    const active = router.pathname == href;
    const [hover, setHover] = useState(false);
    return (
        <div
            className={clsx({
                [styles.nav_link]: true,
                [styles.nav_link_active]: active,
                "crt-colorsep": hover && !active,
                "crt-flicker": hover && !active,
            })}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => router.push(href)}
        >
            {children}
        </div >
    );
}

const NavLinkContainer: FC = () => {
    return (
        <div className={styles.nav_links_wrapper}>
            <NavLink href="/">
                <Translated en="Home" zh="首页" jp="ホーム" />
            </NavLink>
            <NavLink href="/about">
                <Translated en="About" zh="关于" jp="概要" />
            </NavLink>
        </div>
    )
}

const NavMenuLangDropdownEntry: FC<{ code: LangsAvailable, name: string }> = ({ code, name }) => {
    const { current, setCurrent } = useContext(LangContext)

    if (current == code) {
        return <></>
    }

    return (
        <div
            className={styles.nav_menu_lang_dropdown_list_entry}
            onClick={() => setCurrent(code)}
        >
            <Image
                src={`/flags_pixel/${languageToCountryCode(code)}.png`}
                width={30}
                height={20}
                alt={`Langauge: ${code}`}
            />
            <span>{name}</span>
        </div>
    )
}

const NavMenuLangDropdown: FC = () => {
    const [shown, setShown] = useState(false)
    const { current: lang } = useContext(LangContext)

    return (
        <div className={styles.nav_menu_lang_dropdown}>
            <div
                className={clsx({
                    [styles.nav_menu_lang_dropdown_current]: true,
                    [styles.nav_menu_lang_dropdown_current_active]: shown,
                })}
                onClick={() => setShown(!shown)}
            >
                <span>
                    <Translated
                        en="Current Language:"
                        zh="当前语言:"
                        jp="今の言語:"
                    />
                </span>
                <Image
                    src={`/flags_pixel/${languageToCountryCode(lang)}.png`}
                    width={30}
                    height={20}
                    alt={`Langauge: ${lang}`}
                />
            </div>
            <div className={clsx({
                [styles.nav_menu_lang_dropdown_list]: true,
                [styles.nav_menu_lang_dropdown_list_collapsed]: !shown,
            })}>
                <NavMenuLangDropdownEntry code="zh" name="中文" />
                <NavMenuLangDropdownEntry code="en" name="English" />
                <NavMenuLangDropdownEntry code="jp" name="日本語" />
            </div>
        </div >
    )
}

const NavMenu: FC = () => {
    const { shown } = useContext(NavMenuShownContext)

    return (
        <div className={clsx({
            [pixelFont.className]: true,
            [styles.nav_menu_wrapper]: true,
            [styles.nav_menu_wrapper_collapsed]: !shown
        })}>
            <div className={styles.nav_menu}>
                <NavLinkContainer />
                <NavMenuLangDropdown />
            </div>
        </div>
    )
}

export default NavMenu

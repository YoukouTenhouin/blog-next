import { useState } from 'react'
import clsx from "clsx";

import Navbar from "./navbar";
import NavMenu, { NavMenuShownContext } from './nav_menu'

import styles from "./layout.module.css";


function Background() {
    return (
        <div className={styles.background_wrapper}>
            <div className={clsx(styles.background, "crt", "crt-darkcorner")}></div>
        </div>
    );
}

export default function Layout({ children }) {
    const [navMenuShown, setNavMenuShown] = useState(false)

    return (
        <NavMenuShownContext.Provider value={{
            shown: navMenuShown,
            setShown: setNavMenuShown
        }}>
            <Background />
            <Navbar />
            <NavMenu />
            <div className={styles.wrapper}>
                <div className={styles.container}>{children}</div>
            </div>
        </NavMenuShownContext.Provider>
    );
}

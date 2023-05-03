import Link from 'next/link'
import Image from 'next/image'
import styles from './sidebar.module.css'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import React, { FC, ReactNode, useState } from 'react'

export default function Sidebar() {
    const NavEntry: FC<{ href: string, children: ReactNode }> = ({ href, children }) => {
        const router = useRouter()
        const active = router.pathname == href
        const [hover, setHover] = useState(false);
        return (
            <li
                className={clsx({
                    [styles.nav_active]: active,
                    'crt-colorsep': hover && !active,
                    'crt-flicker': hover && !active
                })}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <Link href={href}>{children}</Link>
            </li>
        )
    }

    return (
        <div className={`${styles.sidebar_container} crt`}>
            <div className={styles.sidebar}>
                <div className={`${styles.sitename} crt-colorsep`}>
                    <h1 className={styles.sitename_cn}>東亞國中央廣播電臺</h1>
                    <h1 className={styles.sitename_en}>EASTASIA CENTRAL RADIO STATION</h1>
                </div>
                <div className={styles.profile}>
                    <div className={`${styles.profile_image} crt-darkcorner`}>
                        <Image
                            src="profile.png"
                            height={144}
                            width={144}
                            alt="Youkou Tenhouin" />
                    </div>
                    <span >Youkou Tenhouin</span>
                </div>
                <div className={styles.nav}>
                    <ul>
                        <NavEntry href="/">Home</NavEntry>
                    </ul>
                </div>
            </div>
        </div>
    )
}
import styles from "./sitelogo.module.css"
import localFont from "next/font/local"
import clsx from "clsx"

const font = localFont({ src: '../fonts/GlowSansTC.otf' })

export default function SiteLogo() {
    return (
        <div className={clsx(styles.sitelogo, "crt", "crt-colorsep" )}>
          <h1 className={clsx(styles.sitelogo_cn, font.className)}>東亞國中央廣播電臺</h1>
          <h1 className={clsx(styles.sitelogo_en, font.className)}>EASTASIA CENTRAL RADIO STATION</h1>
        </div>
        )
}
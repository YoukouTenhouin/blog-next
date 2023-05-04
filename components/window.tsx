import { FC, ReactNode } from "react";
import styles from "./window.module.css"
import clsx from "clsx"

const Window: FC<{ title: string, children: ReactNode, crt?: boolean}> = ({ title, children, crt }) => (
    <div className={clsx({
        [styles.window_wrapper]: true,
        crt: crt
    })}>
        <div className={styles.window_container}>
            <div className={clsx({
                [styles.window_title]: true,
                "crt-colorsep": crt
            })}>
                <h2>{ title }</h2>
            </div>
            <div className={styles.window_body}>
                {children}
            </div>
        </div>
    </div>
)

export default Window
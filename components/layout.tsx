import clsx from 'clsx';
import styles from './layout.module.css';
import Sidebar from './sidebar';

function Background() {
    return (
        <div className={styles.background_wrapper}>
        <div className={clsx(styles.background, "crt", "crt-darkcorner")}>
        </div>
        </div>
    )
}

export default function Layout({ children }) {
    return (
        <>
        <Background />
        <Sidebar />
       <div className={styles.container}>{children}</div>
       </>
    )
}
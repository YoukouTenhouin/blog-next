import styles from './layout.module.css';
import Sidebar from './sidebar';

export default function Layout({ children }) {
    return (
        <>
        <Sidebar />
       <div className={styles.container}>{children}</div>
       </>
    )
}
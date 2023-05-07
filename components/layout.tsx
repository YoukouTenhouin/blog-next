import clsx from "clsx";
import styles from "./layout.module.css";
import Navbar from "./navbar";

function Background() {
  return (
    <div className={styles.background_wrapper}>
      <div className={clsx(styles.background, "crt", "crt-darkcorner")}></div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <Background />
      <Navbar />
      <div className={styles.wrapper}>
        <div className={styles.container}>{children}</div>
      </div>
    </>
  );
}

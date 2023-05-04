import { FC, ReactNode } from "react";
import styles from "./window.module.css";
import clsx from "clsx";

const Window: FC<{ title: string; children: ReactNode; crt?: boolean }> = ({
  title,
  children,
  crt,
}) => (
  <div className={styles.window_wrapper}>
    <div
      className={clsx({
        [styles.window_container]: true,
        crt: crt,
      })}
    >
      <div
        className={clsx({
          [styles.window_title]: true,
          "crt-colorsep": crt,
        })}
      >
        <span>{title}</span>
      </div>
      <div className={styles.window_body}>{children}</div>
    </div>
  </div>
);

export default Window;

import React, { FC, FunctionComponent, ReactNode } from "react";
import styles from "./window.module.css";
import clsx from "clsx";
import localFont from "next/font/local";
import { Inconsolata } from "next/font/google";

const pixelFont = localFont({ src: "../fonts/fusion-pixel-monospaced.woff2" });
const termFont = Inconsolata({ subsets: ["latin"] });

const Termline: FC<{
  cursor?: boolean;
  children: ReactNode;
  pixel?: boolean;
}> = ({ cursor, children, pixel }) => {
  return (
    <div
      className={clsx({
        [termFont.className]: !pixel,
        [pixelFont.className]: pixel,
      })}
    >
      <span className={styles.termline}>{children}</span>
      {cursor ? <span className={styles.termline_cursor}>&nbsp;</span> : <></>}
    </div>
  );
};

interface WindowSubComponents {
  Termline: typeof Termline;
}

const Window: FC<{ title: string; children: ReactNode; crt?: boolean }> &
  WindowSubComponents = ({ title, children, crt }) => (
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
          [pixelFont.className]: true,
          "crt-colorsep": crt,
        })}
      >
        <span>{title}</span>
      </div>
      <div className={styles.window_body}>{children}</div>
    </div>
  </div>
);

Window.Termline = Termline;

export default Window;

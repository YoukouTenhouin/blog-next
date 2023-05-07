import React, { FC, FunctionComponent, ReactNode } from "react";
import styles from "./window.module.css";
import clsx from "clsx";
import localFont from "next/font/local";
import { Noto_Emoji, Inconsolata } from "next/font/google";

const pixelFont = localFont({ src: "../fonts/fusion-pixel-monospaced.woff2" });
const termFont = Inconsolata({ subsets: ["latin"] });
const notoEmoji = Noto_Emoji({ subsets: ["emoji"] });

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

const TitleBar: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={styles.window_title}>{children}</div>;
};

const TitleText: FC<{ colorsep?: boolean; children: ReactNode }> = ({
  colorsep,
  children,
}) => {
  return (
    <div
      className={clsx({
        [styles.window_title_text]: true,
        [pixelFont.className]: true,
        "crt-colorsep": colorsep,
      })}
    >
      <span>{children}</span>
    </div>
  );
};

const TitleButtonGroup: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={styles.title_button_group}>{children}</div>;
};

const TitleButton: FC<{ onClick?: () => void, children: ReactNode }> = ({
  onClick,
  children,
}) => {
  return (
    <div
      className={clsx({
        [notoEmoji.className]: true,
        [styles.title_button]: true,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Body: FC<{ folded?: boolean; children: ReactNode }> = ({
  folded,
  children,
}) => {
  return (
    <div
      className={clsx({
        [styles.window_body]: true,
        [styles.window_body_folded]: folded,
        [styles.window_body_expanded]: !folded,
      })}
    >
      {children}
    </div>
  );
};

interface WindowSubComponents {
  Termline: typeof Termline;
  TitleBar: typeof TitleBar;
  TitleButton: typeof TitleButton;
  TitleButtonGroup: typeof TitleButtonGroup;
  TitleText: typeof TitleText;
  Body: typeof Body;
}

const Window: FC<{ children: ReactNode; crt?: boolean }> &
  WindowSubComponents = ({ children, crt }) => (
  <div className={styles.window_wrapper}>
    <div className={clsx(styles.window_container)}>{children}</div>
  </div>
);

Window.Termline = Termline;
Window.TitleBar = TitleBar;
Window.TitleButton = TitleButton;
Window.TitleButtonGroup = TitleButtonGroup;
Window.TitleText = TitleText;
Window.Body = Body;

export default Window;

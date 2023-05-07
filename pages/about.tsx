import Window from "../components/window";
import Layout from "../components/layout";
import styles from "../styles/About.module.css";
import { FC, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Inconsolata } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import LangContext from "../components/langcontext";
import { TermLine } from "../lib/minivm/term";
import translated from "../lib/translated";
import { FSNode } from "../lib/minivm/fs";
import MiniVM from "../lib/minivm/vm";

const pixelFont = localFont({ src: "../fonts/fusion-pixel-monospaced.woff2" });
const termFont = Inconsolata({ subsets: ["latin"] });

const getTextWidth = (str: string) => {
  let width = 0;
  for (let i = 0; i < str.length; ++i) {
    width += str.charCodeAt(i) <= 0xff ? 1 : 2;
  }
  return width;
};

const pad = (len: number, char: string = " ") => {
  return char.repeat(Math.ceil(len / char.length));
};

const InputLine: FC<{ line: string; cursorPos: number; focused?: boolean }> = ({
  line,
  cursorPos,
  focused,
}) => {
  return (
    <div className={styles.inputline}>
      <span>{"> "}</span>
      {`${line} `.split("").map((char, idx) => (
        <span
          key={idx}
          className={clsx({
            [styles.inputline_cursor]: focused && idx == cursorPos,
          })}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

const TermWindow: FC<{ vm: MiniVM; lines: TermLine[] }> = ({ vm, lines }) => {
  const { current: currentLang } = useContext(LangContext);

  return (
    <>
      {lines.map((l, idx) => {
        let width = 0;
        // track current width for alignment
        return (
          <Window.Termline key={idx} pixel={currentLang === "cn"}>
            {l.map((s) => {
              switch (s.type) {
                case "image":
                  return (
                    <div key={idx} className={styles.img_wrapper}>
                      <Image
                        src={s.src}
                        key={idx}
                        width={s.width}
                        height={s.height}
                        alt=""
                      />
                    </div>
                  );
                case "text":
                  const text =
                    typeof s.content === "string"
                      ? s.content
                      : translated(currentLang, s.content);
                  let ret = (
                    <span
                      className={clsx({
                        [styles.term_section]: true,
                        [styles.term_section_clickable]: s.commandOnClick,
                      })}
                      onClick={
                        s.commandOnClick &&
                        (() => {
                          vm.printLn(`> ${s.commandOnClick}`);
                          vm.exec(s.commandOnClick);
                        })
                      }
                    >
                      {s.alignment ? pad(Math.max(s.alignment - width, 0)) : ""}
                      {text}
                    </span>
                  );
                  width += (s.alignment ?? 0) + getTextWidth(text);
                  return ret;
              }
            })}
          </Window.Termline>
        );
      })}
    </>
  );
};

function kv(k: string, v: string): TermLine;
function kv(en_k: string, en_v: string, cn_k: string, cn_v: string): TermLine;
function kv(en_k: string, v: string, cn_k: string): TermLine;
function kv(
  en_k: string,
  en_v: string,
  cn_k?: string,
  cn_v?: string
): TermLine {
  if (cn_k) {
    return [
      {
        type: "text",
        content: {
          en: en_k,
          cn: cn_k,
        },
      },
      {
        type: "text",
        content: "| ",
        alignment: 20,
      },
      {
        type: "text",
        content: cn_v ? { en: en_v, cn: cn_v } : en_v,
      },
    ];
  } else {
    return [
      {
        type: "text",
        content: en_k,
      },
      {
        type: "text",
        content: "| ",
        alignment: 20,
      },
      {
        type: "text",
        content: en_v,
      },
    ];
  }
}

const e = (cmd: string) => ({ type: "exec" as "exec", command: cmd });

// Filesystem Content
const fsRoot: FSNode = {
  type: "dir",
  children: {
    bin: {
      type: "dir",
      children: {
        autorun: {
          type: "prog",
          code: [
            e("cd /usr/youkou"),
            e("show profimg"),
            e("show info"),
            e("cd skills"),
            e("show programming"),
            e("show languages"),
            e("cd"),
            e("cd site"),
            e("show thanks"),
          ],
        },
      },
    },
    usr: {
      type: "dir",
      children: {
        youkou: {
          type: "dir",
          children: {
            profimg: {
              type: "file",
              content: [
                [
                  {
                    type: "image",
                    src: "/profile.png",
                    width: 144,
                    height: 144,
                  },
                ],
              ],
            },
            info: {
              type: "file",
              content: [
                kv("NAME", "Youkou Tenhouin", "名称", "天鳳院瑤光"),
                kv("MAIL", "youkou@tenhou.in", "邮箱"),
                kv("GITHUB ACCOUNT", "https://github.com/MosakujiHokuto/"),
                kv("ORGANIZATION", "SUSE LLC, Taien labs", "组织"),
              ],
            },
            skills: {
              type: "dir",
              children: {
                programming: {
                  type: "file",
                  content: [
                    kv("C", "TRUE"),
                    kv("C++", "TRUE"),
                    kv("Python", "TRUE"),
                    kv("TypeScript", "TRUE"),
                    kv("Perl", "TRUE"),
                    kv("Erlang", "TRUE"),
                  ],
                },
                languages: {
                  type: "file",
                  content: [
                    kv("Mandarin", "Native", "中文（普通话）", "母语"),
                    kv("English", "Intermediate", "英文", "中等"),
                    kv("Japanese", "Primary", "日语", "初级"),
                  ],
                },
              },
            },
          },
        },
      },
    },
    site: {
      type: "dir",
      children: {
        thanks: {
          type: "file",
          content: [
            kv("WRITTEN IN", "TypeScript", "使用语言"),
            kv("LOGO FONT", "GlowSans", "LOGO 字体", "未来荧黑"),
            kv("PIXEL FONT", "Fusion Pixel", "像素字体", "缝合怪像素字体"),
          ],
        },
      },
    },
  },
};

const printGreeting = (vm: MiniVM) => {
  vm.printLines(
    [
      "Loading /rpool/boot/kernel...",
      "",
      "HITOMI OS v0.0.1",
      "",
      "Login: guest",
      "Passphrase: ******",
      "",
      "Authentication completed.",
      "",
      "Mounting //dfs_gateway/public to / ...",
      "Done.",
      "",
      "You've now connected to HITOMI Internal Network.",
      "",
    ],
    [
      "加载 /rpool/boot/kernel...",
      "",
      "HITOMI OS v0.0.1",
      "",
      "用户名: guest",
      "密码: ******",
      "",
      "认证完成。",
      "",
      "正在挂载 //dfs_gateway/public 至 / ...",
      "完成。",
      "",
      "你已接入 HITOMI 内部网络。",
      "",
    ]
  )
    .printSection({ type: "text", content: { en: "Type ", cn: "输入 " } })
    .printSection({ type: "text", content: "'help'", commandOnClick: "help" })
    .printSection({
      type: "text",
      content: { en: " for avaliable commands.", cn: " 以查看可用命令列表。" },
    })
    .newLine()
    .printSection({ type: "text", content: { en: "Type ", cn: "输入 " } })
    .printSection({
      type: "text",
      content: "'run bin/autorun'",
      commandOnClick: "run bin/autorun",
    })
    .printSection({
      type: "text",
      content: { en: " to execute autorun demo.", cn: " 以执行全自动展示。" },
    })
    .newLine();
};

export default function About() {
  const [lineBuf, setLineBuf] = useState<TermLine[]>([]);
  const [printPos, setPrintPos] = useState(0);

  const [inputLine, setInputLine] = useState("");
  const [cursorPos, setCursorPos] = useState(0);

  const [focused, setFocused] = useState(false);

  const [vm, setVM] = useState(new MiniVM(fsRoot));

  const { current: currentLang } = useContext(LangContext);

  // Output throttling
  useEffect(() => {
    let i = setInterval(() => {
      setPrintPos(Math.min(printPos + 1, lineBuf.length));
    }, 50);

    return () => {
      clearInterval(i);
    };
  }, [printPos, lineBuf]);

  const initVM = () => {
    // init event listeners
    vm.onInputUpdate = (buf, cursor) => {
      setInputLine(buf);
      setCursorPos(cursor);
    };

    vm.onScreenUpdate = (buf) => {
      setLineBuf([...buf]);
    };

    printGreeting(vm)
  }

  const resetVM = () => {
    setLineBuf([])
    setPrintPos(0)
    setInputLine("")
    setCursorPos(0)
    setVM(new MiniVM(fsRoot))
  }

  useEffect(() => {
    initVM()
  }, [vm])

  return (
    <Layout>
      <div
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          e.preventDefault();

          vm.onKeyboardEvent(e);
        }}
      >
        <Window>
          <Window.TitleBar>
            <Window.TitleText>REMOTE ACESS TERMINAL</Window.TitleText>
            <Window.TitleButtonGroup>
              <Window.TitleButton onClick={resetVM}>⟲</Window.TitleButton>
            </Window.TitleButtonGroup>
          </Window.TitleBar>
          <Window.Body>
            <div className={styles.about_wrapper}>
              <div
                className={clsx({
                  [styles.about_inner]: true,
                  crt: true,
                  [termFont.className]: currentLang == "en",
                  [pixelFont.className]: currentLang == "cn",
                })}
              >
                <TermWindow
                  vm={vm}
                  lines={lineBuf.slice(
                    0,
                    Math.min(printPos, lineBuf.length - 1)
                  )}
                />
                {printPos >= lineBuf.length ? (
                  <InputLine
                    line={inputLine}
                    cursorPos={cursorPos}
                    focused={focused}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </Window.Body>
        </Window>
      </div>
    </Layout>
  );
}

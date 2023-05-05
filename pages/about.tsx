import Window from "../components/window";
import Layout from "../components/layout";
import styles from "../styles/About.module.css";
import { FC, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Inconsolata } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import LangContext from "../components/langcontext";
import translated, { Translations } from "../lib/translated";
import Translated from "../components/translated";

const pixelFont = localFont({ src: "../fonts/fusion-pixel-monospaced.woff2" });
const termFont = Inconsolata({ subsets: ["latin"] });

interface TermWindowTextLine {
  type: "text";
  content: string | Translations;
}

interface TermWindowImageLine {
  type: "image";
  src: string;
  width: number;
  height: number;
}

interface TermWindowKVPairLine {
  type: "kvpair";
  k: string | Translations;
  v: string | Translations;
}

type TermWindowLine =
  | TermWindowTextLine
  | TermWindowImageLine
  | TermWindowKVPairLine;

function txt(str: string | string[]): TermWindowTextLine[];
function txt(en: string, cn: string): TermWindowTextLine[];
function txt(en: string[], cn: string[]): TermWindowTextLine[];
function txt(
  en: string | string[],
  cn?: string | string[]
): TermWindowTextLine[] {
  if (!cn) {
    if (typeof en === "string") {
      return [
        {
          type: "text",
          content: en,
        },
      ];
    } else {
      return en.map((l) => ({
        type: "text",
        content: l,
      }));
    }
  } else {
    if (typeof en === "string" && typeof cn === "string") {
      return [
        {
          type: "text",
          content: {
            en: en,
            cn: cn,
          },
        },
      ];
    } else if (typeof en === "string") {
      return [
        {
          type: "text",
          content: en,
        },
      ];
    } else if (typeof cn === "string") {
      return en.map((l) => ({
        type: "text",
        content: l,
      }));
    } else {
      return en.map((l, i) => ({
        type: "text",
        content: {
          en: l,
          cn: cn[i],
        },
      }));
    }
  }
}

function kv(k: string, v: string): TermWindowKVPairLine;
function kv(
  en_k: string,
  en_v: string,
  cn_k: string,
  cn_v: string
): TermWindowKVPairLine;
function kv(en_k: string, v: string, cn_k: string): TermWindowKVPairLine;
function kv(
  en_k: string,
  en_v: string,
  cn_k?: string,
  cn_v?: string
): TermWindowKVPairLine {
  if (cn_k) {
    return {
      type: "kvpair",
      k: {
        en: en_k,
        cn: cn_k,
      },
      v: cn_v ? { en: en_v, cn: cn_v } : en_v,
    };
  } else {
    return {
      type: "kvpair",
      k: en_k,
      v: en_v,
    };
  }
}

const pad = (str: string, len: number) => {
    let width = 0;
    for (let i = 0; i < str.length; ++i ) {
        width += (str.charCodeAt(i) <= 0xff ? 1 : 2)
    }
    const padLen = Math.max(1, len - width);
    return str + " ".repeat(padLen)
};

const TermWindow: FC<{ lines: TermWindowLine[] }> = ({ lines }) => {
  const { current: currentLang } = useContext(LangContext);

  return (
    <>
      {lines.map((l, idx) => {
        switch (l.type) {
          case "image":
            return (
              <div key={idx} className={styles.img_wrapper}>
                <Image
                  src={l.src}
                  key={idx}
                  width={l.width}
                  height={l.height}
                  alt=""
                />
              </div>
            );
          case "text":
            return (
              <Window.Termline key={idx} pixel={currentLang === "cn"}>
                {typeof l.content === "string" ? (
                  l.content
                ) : (
                  <Translated {...l.content} />
                )}
              </Window.Termline>
            );
          case "kvpair":
            return (
              <Window.Termline key={idx} pixel={currentLang === "cn"}>
                {`${pad(
                  typeof l.k === "string" ? l.k : translated(currentLang, l.k),
                  24
                )}| ${
                  typeof l.v === "string" ? l.v : translated(currentLang, l.v)
                }`}
              </Window.Termline>
            );
        }
      })}
    </>
  );
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

interface FSFileNode {
  type: "file";
  content: TermWindowLine[];
}

interface FSDirNode {
  type: "dir";
  children: { [key: string]: FSNode };
}

type FSNode = FSFileNode | FSDirNode;

// Filesystem Content
const fsRoot: FSNode = {
  type: "dir",
  children: {
    usr: {
      type: "dir",
      children: {
        youkou: {
          type: "dir",
          children: {
            profimg: {
              type: "file",
              content: [
                { type: "image", src: "/profile.png", width: 144, height: 144 },
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

const getNode = (path: string[], startNode?: FSNode) => {
  let ret = startNode;

  for (let p of path) {
    if (p == "/") {
      ret = fsRoot;
      continue;
    }

    if (ret?.type != "dir") return undefined;

    ret = ret.children[p];
  }

  return ret;
};

const getCwd = () => {
  return getNode(cwd) as FSDirNode;
};

const parsePath = (path: string) => {
  path = path.trim();
  let ret = path.split("/").filter((s) => s);

  if (path.startsWith("/")) ret.unshift("/");

  return normalizePath(ret);
};

const serializePath = (path: string[]) => {
  if (path.length == 0) return "";
  if (path[0] == "/") return "/" + path.slice(1).join("/");
  return path.join("/");
};

function normalizePath(path: string): string;
function normalizePath(path: string[]): string[];
function normalizePath(path: string | string[]) {
  if (typeof path == "string") {
    return serializePath(parsePath(path));
  }

  let ret = [];
  for (let p of path) {
    if (p == "/") {
      ret.push("/");
      continue;
    }
    if (p == ".") continue;
    if (p == "..") {
      // Can't go above root
      if (ret.length == 1 && ret[0] == "/") continue;

      if (ret.length == 0) {
        // Keep as-is
        ret.push("..");
        continue;
      }

      if (ret[path.length - 1] == "..") {
        // Keep as-is
        ret.push("..");
        continue;
      }

      ret.pop();
      continue;
    }

    ret.push(p);
  }

  return ret;
}

const resolvePath = (path: string[]) => normalizePath(cwd.concat(path));

// Machine States
let scrBuf: TermWindowLine[] = [];
let cwd: string[] = ["/"];

const history: string[] = [];
let historyPrefix: string | null = null;
let historyPos = 0;

let completions: string[] = [];
let completionPos = 0;

interface CommandHandler {
  (args: string[]): void;
}

const greetingText = {
  en: [
    "Loading /rpool/boot/kernel...",
    "",
    "HITOMI OS v0.0.1",
    "",
    "Login: guest",
    "Passphrase: ******",
    "",
    "Auth complete.",
    "",
    "Mounting //dfs_gateway/public to / ...",
    "Done.",
    "",
    "You've now connected to HITOMI Internal Network.",
    "Type 'help' for avaliable commands.",
  ],
  cn: [
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
    "输入 'help' 以查看可用命令列表。",
  ],
};

export default function About() {
  const [lineBuf, setLineBuf] = useState<TermWindowLine[]>([]);
  const [printPos, setPrintPos] = useState(0);

  const [inputLine, setInputLine] = useState("");
  const [cursorPos, setCursorPos] = useState(0);

  const [focused, setFocused] = useState(false);

  const { current: currentLang } = useContext(LangContext);

  const doPrintLines = (lines: (string | Translations)[]) => {
    // Update Machine State
    scrBuf = scrBuf.concat(
      lines.map((l) => {
        const ret: TermWindowLine = {
          type: "text",
          content: l,
        };
        return ret;
      })
    );
    // Update Component State
    setLineBuf(scrBuf);
  };

  const doPrint = (line: string | Translations) => {
    if (typeof line === "string") {
      doPrintLines(line.split("\n"));
    } else {
      doPrintLines([line]);
    }
  };

  const printLines = (lines: {
    [key: string]: string[];
    en: string[];
    cn?: string[];
  }) => {
    doPrintLines(
      lines.en.map((v, i) => ({
        en: v,
        cn: lines.cn[i],
      }))
    );
  };

  const print = (line: string | Translations) => {
    doPrint(line);
  };

  const handlers: { [key: string]: CommandHandler } = {
    help(args) {
      if (args.length > 1) {
        // Usage
        print({
          en: "Usage: help",
          cn: "用法: help",
        });
        return;
      }
      printLines({
        en: [
          "Avaliable commands:",
          "\tcd\tChange current working directory",
          "\tclear\tClear Screen",
          "\tls\tList files in current directory",
          "\thelp\tShow avaliable commands",
          "\tpwd\tShow current working directory",
          "\tshow\tShow the content of the file",
        ],
        cn: [
          "可用命令:",
          "\tcd\t切换当前目录",
          "\tclear\t清空显示区域",
          "\tls\t列出当前目录下的文件",
          "\thelp\t列出可用命令",
          "\tpwd\t显示当前目录",
          "\tshow\t显示文件内容",
        ],
      });
    },
    clear(args){
        if (args.length > 1) {
            // Usage
            print({
                en: "Usage: clear",
                cn: "用法: clear"
            })
            return;
        }
        scrBuf = []
        setLineBuf(scrBuf)   
        setPrintPos(0)
    },
    cd(args) {
      if (args.length > 2) {
        // Usage
        print({
          en: "Usage: cd <path>",
          cn: "用法: cd <路径>",
        });
        return;
      }

      if (args.length == 1) {
        cwd = ["/"];
        return;
      }

      let newCwd = resolvePath(parsePath(args[1]));

      // Check if path is valid
      if (getNode(newCwd)?.type != "dir") {
        // Invalid
        print({
          en: "Invalid path.",
          cn: "无效路径。",
        });
        return;
      }

      cwd = newCwd;
    },
    ls(args) {
      if (args.length > 2) {
        print({
          en: "Usage: ls <path>",
          cn: "用法: ls <路径>",
        });
        return;
      }

      let node: FSNode | undefined = getCwd();
      if (args.length > 1) {
        node = getNode(resolvePath(parsePath(args[1])));
      }

      if (!node) {
        print({
          en: "Invalid Path.",
          cn: "无效路径。",
        });
        return;
      }

      if (node.type == "file") {
        print(normalizePath(args[1]));
        return;
      }

      if (node.type == "dir") {
        print(".");
        print("..");
        for (let k in node.children) {
          print({
            en: `${pad(k, 20)}${
              node.children[k].type == "dir" ? "DIR" : "FILE"
            }`,
            cn: `${pad(k, 20)}${
              node.children[k].type == "dir" ? "目录" : "文件"
            }`,
          });
        }
        return;
      }
    },
    pwd(args) {
      if (args.length > 1) {
        print({
          en: "Usage: pwd",
          cn: "用法: pwd",
        });
        return;
      }

      print(serializePath(cwd));
    },
    show(args) {
      if (args.length != 2) {
        print({
          en: "Usage: show <path>",
          cn: "用法: show <路径>",
        });
        return;
      }

      let node = getNode(resolvePath(parsePath(args[1])));
      if (!node) {
        print({
          en: "File not found.",
          cn: "找不到文件。",
        });
        return;
      }

      if (node.type == "dir") {
        print({
          en: "Can not show directory.",
          cn: "无法显示目录。",
        });
        return;
      }

      scrBuf = scrBuf.concat(node.content);
      setLineBuf(scrBuf);
    },
  };

  const doExec = () => {
    const args = inputLine
      .split(" ")
      .filter((s) => s.length > 0)
      .map((s) => s.trim());
    if (!args.length) return;

    const handler = handlers[args[0]];
    if (!handler) {
      print({ en: "Invalid input.", cn: "无效输入。" });
      return;
    }

    handler(args);
  };

  // Output throttling
  useEffect(() => {
    let i = setInterval(() => {
      setPrintPos(Math.min(printPos + 1, lineBuf.length + 1));
    }, 100);

    return () => {
      clearInterval(i);
    };
  }, [printPos, lineBuf]);

  useEffect(() => {
    printLines(greetingText);
  }, []);

  // Completion
  const doCompletion = () => {
    if (!inputLine.trim().length) {
      return;
    }

    if (cursorPos === 0 && inputLine.length !== 0 && inputLine[0] !== " ") {
      return;
    }

    if (!completions.length) {
      // find candidates
      const splitedInput = inputLine.slice(0, cursorPos).split(" ");
      const prefix = splitedInput[splitedInput.length - 1];
      if (splitedInput.length == 1) {
        // command completion
        completions = Object.keys(handlers).filter((s) => s.startsWith(prefix));
        completionPos = 0;
      } else if (!prefix.length) {
        // file completion at cwd
        const node = getCwd();
        completions = Object.keys(node.children).map((k) =>
          node.children[k].type == "dir" ? `${k}/` : k
        );
        completionPos = 0;
      } else {
        // path completion
        const resolved = resolvePath(parsePath(prefix));

        if (prefix.endsWith("/")) {
          // path is a complete directory; candidates from children
          const node = getNode(resolved);
          if (node?.type != "dir") return;

          completions = Object.keys(node.children).map((k) =>
            node.children[k].type == "dir" ? `${prefix}${k}/` : `${prefix}${k}`
          );
          completionPos = 0;
        } else {
          // path is incomplete; candidates from parent's children

          // get parent
          if (resolved.length != 1) resolved.pop();
          const node = getNode(resolved);
          if (node?.type != "dir") return;

          // get file prefix and candidate prefix
          let fnPrefix = "";
          let cPrefix = "";

          const slashIdx = prefix.lastIndexOf("/");
          if (slashIdx === -1) {
            fnPrefix = prefix;
          } else {
            fnPrefix = prefix.slice(slashIdx + 1);
            cPrefix = prefix.slice(0, slashIdx) + "/";
          }

          if (fnPrefix == "." || fnPrefix == "..") {
            if (node == fsRoot) {
              return;
            }

            // complete to '../'
            completions = [`${cPrefix}../`];
            completionPos = 0;
          } else {
            completions = Object.keys(node.children)
              .filter((k) => k.startsWith(fnPrefix))
              .map(
                (k) =>
                  node.children[k].type == "dir"
                    ? `${cPrefix}${k}/`
                    : `${cPrefix}${k}` // suffix dir candidates with '/'
              );
            completionPos = 0;
          }
        }
      }
    }

    // rotate candidates
    if (completions.length) {
      let before = inputLine.slice(0, cursorPos);
      let after = inputLine.slice(cursorPos);

      if (before.lastIndexOf(" ") === -1) {
        before = "";
      } else {
        before = before.slice(0, before.lastIndexOf(" ")) + " ";
      }

      if (after.length) {
        after = " " + after;
      }

      ++completionPos;
      if (completionPos >= completions.length) completionPos = 0;
      const candidate = completions[completionPos];

      if (completions.length == 1) {
        // only one candidate, finish completion

        if (completions[0].endsWith("/")) {
          setInputLine(`${before}${candidate}${after}`);
          setCursorPos(`${before}${candidate}`.length);
        } else {
          setInputLine(`${before}${candidate} ${after}`);
          setCursorPos(`${before}${candidate} `.length);
        }
        completions = [];
      } else {
        setInputLine(`${before}${candidate}${after}`);
        setCursorPos(`${before}${candidate}`.length);
      }
    }
  };

  // Keyboard event handlers
  const doBackspace = () => {
    if (cursorPos == 0) return;
    setInputLine(
      inputLine.slice(0, cursorPos - 1) + inputLine.slice(cursorPos)
    );
    historyPrefix = null;
    completions = [];
    setCursorPos(cursorPos - 1);
  };

  const doDelete = () => {
    setInputLine(
      inputLine.slice(0, cursorPos) + inputLine.slice(cursorPos + 1)
    );
    historyPrefix = null;
    completions = [];
    setCursorPos(Math.min(cursorPos, inputLine.length));
  };

  const doArrowLeft = () => {
    setCursorPos(Math.max(cursorPos - 1, 0));
    completions = [];
  };

  const doArrowRight = () => {
    setCursorPos(Math.min(cursorPos + 1, inputLine.length));
    completions = [];
  };

  const doArrowUp = () => {
    completions = [];

    if (historyPrefix === null) {
      historyPrefix = inputLine;
    }

    const candidates = history
      .map((l, i) => ({ l: l, i: i }))
      .filter(({ l, i }) => l.startsWith(historyPrefix) && i < historyPos);
    if (!candidates.length) return;
    const candidate = candidates[candidates.length - 1];

    historyPos = candidate.i;
    setInputLine(candidate.l);
    setCursorPos(candidate.l.length);
  };

  const doArrowDown = () => {
    completions = [];

    if (historyPrefix === null) return;

    const candidates = history
      .map((l, i) => ({ l: l, i: i }))
      .filter(({ l, i }) => l.startsWith(historyPrefix) && i > historyPos);

    if (!candidates.length) {
      historyPos = history.length;
      setInputLine(historyPrefix);
      setCursorPos(historyPrefix.length);
    } else {
      const candidate = candidates[0];

      historyPos = candidate.i;
      setInputLine(candidate.l);
      setCursorPos(candidate.l.length);
    }
  };

  const doHome = () => {
    completions = [];
    setCursorPos(0);
  };

  const doEnd = () => {
    completions = [];
    setCursorPos(inputLine.length);
  };

  const doKill = () => {
    setInputLine("");
    historyPrefix = null;
    completions = [];
    setCursorPos(0);
  };

  // Line feed
  const doLF = () => {
    if (inputLine.trim().length > 0) {
      // Push into shell history
      history.push(inputLine);
      historyPos = history.length;
    }

    doPrint(`> ${inputLine}`);
    doKill();
  };

  const doSubmit = () => {
    doLF();
    doExec();
  };

  return (
    <Layout>
      <div
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          e.preventDefault();

          // Print throttling animation still in process
          if (printPos <= lineBuf.length) return;

          // CTRL combinations
          if (e.ctrlKey) {
            switch (e.key) {
              case "a":
                doHome();
                break;
              case "e":
                doEnd();
                break;
              case "d":
                doDelete();
                break;
              case "f":
                doArrowRight();
                break;
              case "b":
                doArrowLeft();
                break;
              case "k":
                doKill();
                break;
              case "c":
                doLF();
                break;
              case "j":
                doSubmit();
                break;
            }
            return;
          }

          if (e.altKey) {
            return;
          }

          if (e.metaKey) {
            return;
          }

          // Single character
          if (e.key.length == 1) {
            if (e.key === "/") {
                if (completions.length) {
                    // check if we're completing an dir name
                    if (completions[completionPos].endsWith("/")) {
                        // finish completion
                        completions = []
                        return
                    }
                }
            }
            const before = inputLine.slice(0, cursorPos)
            const after = inputLine.slice(cursorPos)
            setInputLine(`${before}${e.key}${after}`);
            historyPrefix = null;
            completions = [];
            setCursorPos(cursorPos + 1);
            return;
          }

          if (e.key == "ArrowLeft") {
            doArrowLeft();
            return;
          }

          if (e.key == "ArrowRight") {
            doArrowRight();
            return;
          }

          if (e.key == "ArrowUp") {
            doArrowUp();
            return;
          }

          if (e.key == "ArrowDown") {
            doArrowDown();
            return;
          }

          if (e.key == "Backspace") {
            doBackspace();
            return;
          }

          if (e.key == "Delete") {
            doDelete();
            return;
          }

          if (e.key == "Home") {
            doHome();
            return;
          }

          if (e.key == "End") {
            doEnd();
            return;
          }

          if (e.key == "Enter") {
            doSubmit();
            return;
          }

          if (e.key == "Tab") {
            doCompletion();
            return;
          }
        }}
      >
        <Window title="TERM" crt>
          <div className={styles.about_wrapper}>
            <div
              className={clsx({
                [styles.about_inner]: true,
                [termFont.className]: currentLang == "en",
                [pixelFont.className]: currentLang == "cn",
              })}
            >
              <TermWindow lines={lineBuf.slice(0, printPos)} />
              {printPos > lineBuf.length ? (
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
        </Window>
      </div>
    </Layout>
  );
}

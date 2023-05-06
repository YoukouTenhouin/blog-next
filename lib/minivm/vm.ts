import { Translations } from "../translated";
import { commandHandlers } from "./commands";
import FS, { FSDirNode, FSNode } from "./fs";
import { TermLine, TermSection } from "./term";

export default class MiniVM {
  private scrBuf: TermLine[] = [[]];

  private cwd: string[] = ["/"];

  private historyState: {
    records: string[];
    prefix: string | null;
    pos: number;
  } = {
    records: [],
    prefix: null,
    pos: 0,
  };

  private completionState: {
    candidates: string[];
    pos: number;
  } = {
    candidates: [],
    pos: 0,
  };

  private inputState: {
    buf: string;
    cursor: number;
  } = {
    buf: "",
    cursor: 0,
  };

  private rootFS: FS;

  constructor(_rootFS: FSNode) {
    this.rootFS = new FS(_rootFS);
  }

  public onScreenUpdate: (buf: TermLine[]) => void = () => {};
  public onInputUpdate: (buf: string, cursor: number) => void = () => {};

  public exec(input: string) {
    input.split(";").forEach((cmd) => {
      const args = cmd
        .split(" ")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (!args.length) return;

      const handler = commandHandlers[args[0]];
      if (!handler) {
        this.printError({ en: "Invalid input.", cn: "无效输入。" });
        return;
      }

      handler(this, cmd);
    });
  }

  private doCompletion() {
    if (!this.inputState.buf.trim().length) {
      // Empty input, return
      return;
    }

    if (
      this.inputState.cursor === 0 &&
      this.inputState.buf.length !== 0 &&
      this.inputState.buf[0] !== " "
    ) {
      // Avoid completion when cursor is at the beginning
      return;
    }

    if (!this.completionState.candidates.length) {
      // find candidates
      const splitedInput = this.inputState.buf
        .slice(0, this.inputState.cursor)
        .split(" ");
      const prefix = splitedInput[splitedInput.length - 1];

      if (splitedInput.length == 1) {
        // command completion
        this.completionState.candidates = Object.keys(commandHandlers).filter(
          (s) => s.startsWith(prefix)
        );
        this.completionState.pos = 0;
      } else if (!prefix.length) {
        // file completion at cwd
        const node = this.getCwdNode();
        this.completionState.candidates = Object.keys(node.children).map((k) =>
          node.children[k].type == "dir" ? `${k}/` : k
        );
        this.completionState.pos = 0;
      } else {
        // path completion
        const resolved = this.resolvePath(FS.parsePath(prefix));

        if (prefix.endsWith("/")) {
          // path is a complete directory; candidates from children
          const node = this.rootFS.getNode(resolved);
          if (node?.type != "dir") return;

          this.completionState.candidates = Object.keys(node.children).map(
            (k) =>
              node.children[k].type == "dir"
                ? `${prefix}${k}/`
                : `${prefix}${k}`
          );
          this.completionState.pos = 0;
        } else {
          // path is incomplete; candidates from parent's children

          // get parent
          if (resolved.length != 1) resolved.pop();
          const node = this.rootFS.getNode(resolved);
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
            if (node == this.rootFS.getRoot()) {
              return;
            }

            // complete to '../'
            this.completionState.candidates = [`${cPrefix}../`];
            this.completionState.pos = 0;
          } else {
            this.completionState.candidates = Object.keys(node.children)
              .filter((k) => k.startsWith(fnPrefix))
              .map(
                (k) =>
                  node.children[k].type == "dir"
                    ? `${cPrefix}${k}/`
                    : `${cPrefix}${k}` // suffix dir candidates with '/'
              );
            this.completionState.pos = 0;
          }
        }
      }
    }

    // rotate candidates
    if (this.completionState.candidates.length) {
      let before = this.inputState.buf.slice(0, this.inputState.cursor);
      let after = this.inputState.buf.slice(this.inputState.cursor);

      if (before.lastIndexOf(" ") === -1) {
        before = "";
      } else {
        before = before.slice(0, before.lastIndexOf(" ")) + " ";
      }

      if (after.length) {
        after = " " + after;
      }

      ++this.completionState.pos;
      if (this.completionState.pos >= this.completionState.candidates.length)
        this.completionState.pos = 0;
      const candidate =
        this.completionState.candidates[this.completionState.pos];

      if (this.completionState.candidates.length == 1) {
        // only one candidate, finish completion

        if (this.completionState.candidates[0].endsWith("/")) {
          this.inputState.buf = `${before}${candidate}${after}`;
          this.inputState.cursor = `${before}${candidate}`.length;
        } else {
          this.inputState.buf = `${before}${candidate} ${after}`;
          this.inputState.cursor = `${before}${candidate} `.length;
        }
        this.completionState.candidates = [];
      } else {
        this.inputState.buf = `${before}${candidate}${after}`;
        this.inputState.cursor = `${before}${candidate}`.length;
      }

      this.signalInputUpdate();
    }
  }

  private resetCompletion() {
    this.completionState.candidates = [];
  }

  private prevHistory() {
    this.resetCompletion();

    if (this.historyState.prefix === null) {
      this.historyState.prefix = this.inputState.buf;
    }

    const candidates = this.historyState.records
      .map((l, i) => ({ l: l, i: i }))
      .filter(
        ({ l, i }) =>
          l.startsWith(this.historyState.prefix) && i < this.historyState.pos
      );
    if (!candidates.length) return;
    const candidate = candidates[candidates.length - 1];

    this.historyState.pos = candidate.i;

    this.inputState.buf = candidate.l;
    this.inputState.cursor = candidate.l.length;
    this.signalInputUpdate();
  }

  private nextHistory() {
    this.resetCompletion();

    if (this.historyState.prefix === null) return;

    const candidates = this.historyState.records
      .map((l, i) => ({ l: l, i: i }))
      .filter(
        ({ l, i }) =>
          l.startsWith(this.historyState.prefix) && i > this.historyState.pos
      );

    if (!candidates.length) {
      this.historyState.pos = history.length;

      this.inputState.buf = this.historyState.prefix;
      this.inputState.cursor = this.historyState.prefix.length;
    } else {
      const candidate = candidates[0];
      this.historyState.pos = candidate.i;

      this.inputState.buf = candidate.l;
      this.inputState.cursor = candidate.l.length;
    }

    this.signalInputUpdate();
  }

  private resetHistoryCompletion() {
    this.historyState.prefix = null;
  }

  // Keyboard event handlers
  private doBackspace() {
    if (this.inputState.cursor == 0) return;
    this.inputState.buf =
      this.inputState.buf.slice(0, this.inputState.cursor - 1) +
      this.inputState.buf.slice(this.inputState.cursor);
    --this.inputState.cursor;

    this.resetHistoryCompletion();
    this.resetCompletion();

    this.signalInputUpdate();
  }

  private doDelete() {
    this.inputState.buf =
      this.inputState.buf.slice(0, this.inputState.cursor) +
      this.inputState.buf.slice(this.inputState.cursor + 1);
    this.inputState.cursor = Math.min(
      this.inputState.cursor,
      this.inputState.buf.length
    );

    this.resetHistoryCompletion();
    this.resetCompletion();

    this.signalInputUpdate();
  }

  private doArrowLeft() {
    this.inputState.cursor = Math.max(this.inputState.cursor - 1, 0);

    this.resetCompletion();

    this.signalInputUpdate();
  }

  private doArrowRight() {
    this.inputState.cursor = Math.min(
      this.inputState.cursor + 1,
      this.inputState.buf.length
    );

    this.resetCompletion();

    this.signalInputUpdate();
  }

  private doArrowUp() {
    this.prevHistory();
  }

  private doArrowDown() {
    this.nextHistory();
  }

  private doHome() {
    this.inputState.cursor = 0;

    this.resetCompletion();

    this.signalInputUpdate();
  }

  private doEnd() {
    this.inputState.cursor = this.inputState.buf.length;

    this.resetCompletion();

    this.signalInputUpdate();
  }

  private doKill() {
    this.inputState.buf = "";
    this.inputState.cursor = 0;

    this.resetCompletion();
    this.resetHistoryCompletion();

    this.signalInputUpdate();
  }

  // Line feed
  private doLF() {
    this.printLn(`> ${this.inputState.buf}`);
    this.doKill();
  }

  private doSubmit() {
    const input = this.inputState.buf;

    this.doLF();
    if (input.trim().length) {
      this.historyState.records.push(input);
      this.historyState.pos = this.historyState.records.length
    }

    this.exec(input);
  }

  public onKeyboardEvent(e: {
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
  }) {
    // CTRL combinations
    if (e.ctrlKey) {
      switch (e.key) {
        case "a":
          this.doHome();
          break;
        case "e":
          this.doEnd();
          break;
        case "d":
          this.doDelete();
          break;
        case "f":
          this.doArrowRight();
          break;
        case "b":
          this.doArrowLeft();
          break;
        case "k":
          this.doKill();
          break;
        case "c":
          this.doLF();
          break;
        case "j":
          this.doSubmit();
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
        if (this.completionState.candidates.length) {
          // check if we're completing an dir name
          if (
            this.completionState.candidates[this.completionState.pos].endsWith(
              "/"
            )
          ) {
            // finish completion
            this.resetCompletion();
            return;
          }
        }
      }
      const before = this.inputState.buf.slice(0, this.inputState.cursor);
      const after = this.inputState.buf.slice(this.inputState.cursor);

      this.inputState.buf = `${before}${e.key}${after}`;
      ++this.inputState.cursor;

      this.signalInputUpdate();

      return;
    }

    if (e.key == "ArrowLeft") {
      this.doArrowLeft();
      return;
    }

    if (e.key == "ArrowRight") {
      this.doArrowRight();
      return;
    }

    if (e.key == "ArrowUp") {
      this.doArrowUp();
      return;
    }

    if (e.key == "ArrowDown") {
      this.doArrowDown();
      return;
    }

    if (e.key == "Backspace") {
      this.doBackspace();
      return;
    }

    if (e.key == "Delete") {
      this.doDelete();
      return;
    }

    if (e.key == "Home") {
      this.doHome();
      return;
    }

    if (e.key == "End") {
      this.doEnd();
      return;
    }

    if (e.key == "Enter") {
      this.doSubmit();
      return;
    }

    if (e.key == "Tab") {
      this.doCompletion();
      return;
    }
  }

  private signalScreenUpdate() {
    this.onScreenUpdate(this.scrBuf);
  }

  private signalInputUpdate() {
    this.onInputUpdate(this.inputState.buf, this.inputState.cursor);
  }

  private doNewLine() {
    this.scrBuf.push([]);
  }

  private doPrintSection(section: TermSection) {
    const currentLine = this.scrBuf[this.scrBuf.length - 1];
    currentLine.push(section);
  }

  public newLine() {
    this.doNewLine();
    this.signalScreenUpdate();
    return this;
  }

  public printSection(section: TermSection) {
    this.doPrintSection(section);
    this.signalScreenUpdate();
    return this;
  }

  public printLn(str: string | Translations) {
    this.doPrintSection({ type: "text", content: str });
    this.doNewLine();
    this.signalScreenUpdate();
    return this;
  }

  public printError(err: string | Translations) {
    this.doPrintSection({ type: "text", content: err, class: "err" });
    this.doNewLine();
    this.signalScreenUpdate();
    return this;
  }

  public printLines(lines: string[] | Translations[]): MiniVM;
  public printLines(en: string[], cn: string[]): MiniVM;
  public printLines(en: string[] | Translations[], cn?: string[]): MiniVM {
    if (cn) {
      en.forEach((en_l, i) => {
        this.doPrintSection({
          type: "text" as "text",
          content: {
            en: en_l,
            cn: cn?.length > i && cn[i],
          },
        });
        this.doNewLine();
      });
    } else {
      en.forEach((l) => {
        this.doPrintSection({ type: "text" as "text", content: l });
        this.doNewLine();
      });
    }

    this.signalScreenUpdate();
    return this;
  }

  public clearScreen() {
    this.scrBuf = [[]];
    this.signalScreenUpdate();
  }

  public getFSNode(path: string[]) {
    return this.rootFS.getNode(path);
  }

  public getCwd() {
    return this.cwd;
  }

  public setCwd(cwd: string[]) {
    this.cwd = cwd;
  }

  public getCwdNode() {
    return this.getFSNode(this.cwd) as FSDirNode;
  }

  public resolvePath(path: string[]) {
    return FS.normalizePath(this.cwd.concat(path));
  }

  public static parseShellInput(input: string) {
    // XXX lazy implementation
    return input.trim().split(" ");
  }
}

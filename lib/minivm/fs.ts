import { TermLine } from "./term";

export interface FSFileNode {
  type: "file";
  content: TermLine[];
}

interface ExecCode {
  type: "exec";
  command: string;
}

type Code = ExecCode;

export interface FSProgNode {
  type: "prog";
  code: Code[];
}

export interface FSDirNode {
  type: "dir";
  children: { [key: string]: FSNode };
}

export type FSNode = FSFileNode | FSDirNode | FSProgNode;

export default class FS {
  constructor(private root: FSNode) {}

  public getNode(path: string[]) {
    let ret: FSNode;
    for (let p of path) {
      if (p == "/") {
        ret = this.root;
        continue;
      }

      if (ret?.type != "dir") return undefined;

      ret = ret.children[p];
    }

    return ret;
  }

  public getRoot() {
    return this.root;
  }

  public static parsePath(path: string) {
    path = path.trim();
    let ret = path.split("/").filter((s) => s);

    if (path.startsWith("/")) ret.unshift("/");

    return FS.normalizePath(ret);
  }

  public static serializePath(path: string[]) {
    if (path.length == 0) return "";
    if (path[0] == "/") return "/" + path.slice(1).join("/");
    return path.join("/");
  }

  public static normalizePath(path: string): string;
  public static normalizePath(path: string[]): string[];
  public static normalizePath(path: string | string[]) {
    if (typeof path == "string") {
      return FS.serializePath(FS.parsePath(path));
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
}

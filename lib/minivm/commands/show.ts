import { CommandHandler } from "../commands";
import FS from "../fs";
import MiniVM from "../vm";

const show: CommandHandler = (vm, input) => {
  const args = MiniVM.parseShellInput(input);

  if (args.length != 2) {
    vm.printLn({
      en: "Usage: show <path>",
      cn: "用法: show <路径>",
    });
    return;
  }

  let node = vm.getFSNode(vm.resolvePath(FS.parsePath(args[1])));
  if (!node) {
    vm.printLn({
      en: "File not found.",
      cn: "找不到文件。",
    });
    return;
  }

  if (node.type == "dir") {
    vm.printError({
      en: "Can not show directory.",
      cn: "无法显示目录。",
    });
    return;
  }

  if (node.type == "prog") {
    vm.printError({
        en: "Can not show program.",
        cn: "无法显示程序内容。"
    })
    return;
  }

  node.content.forEach((l) => {
    l.forEach((s) => vm.printSection(s));
    vm.newLine();
  });
};

export default show;

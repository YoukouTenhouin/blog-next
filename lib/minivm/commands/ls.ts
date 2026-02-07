import { Translations } from "../../translated";
import { CommandHandler } from "../commands";
import FS, { FSNode } from "../fs";
import MiniVM from "../vm";

const NodeTypes: { [key: string]: Translations } = {
    dir: {
        en: "DIR",
        zh: "目录",
    },
    file: {
        en: "FILE",
        zh: "文件",
    },
    prog: {
        en: "PROG",
        zh: "程序",
    },
};

const ls: CommandHandler = (vm, input) => {
    const args = MiniVM.parseShellInput(input);

    console.log(input, args);

    if (args.length > 2) {
        vm.printLn({
            en: "Usage: ls <path>",
            zh: "用法: ls <路径>",
        });
        return;
    }

    let node: FSNode = vm.getCwdNode();
    if (args.length > 1) {
        node = vm.getFSNode(vm.resolvePath(FS.parsePath(args[1])));
    }

    if (!node) {
        vm.printError({
            en: "Invalid Path.",
            zh: "无效路径。",
        });
        return;
    }

    if (node.type == "file") {
        vm.printLn(FS.normalizePath(args[1]));
        return;
    }

    if (node.type == "dir") {
        vm.printLn(".");
        vm.printSection({
            type: "text",
            content: "..",
            commandOnClick: args.length === 1 ? "cd ..; ls" : undefined,
        }).newLine();

        for (let k in node.children) {
            let command;
            switch (node.children[k].type) {
                case "dir":
                    command = `cd ${k}; ls`;
                    break;
                case "file":
                    command = `show ${k}`;
                    break;
                case "prog":
                    command = `run ${k}`;
                    break;
            }

            vm.printSection({
                type: "text",
                content: k,
                commandOnClick: args.length === 1 ? command : undefined,
            })
                .printSection({
                    type: "text",
                    content: NodeTypes[node.children[k].type],
                    alignment: 20,
                })
                .newLine();
        }
        return;
    }
};

export default ls;

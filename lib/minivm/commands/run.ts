import { CommandHandler } from "../commands";
import FS from "../fs";
import MiniVM from "../vm";

const run: CommandHandler = (vm, input) => {
    const args = MiniVM.parseShellInput(input);
    if (args.length != 2) {
        // Usage
        vm.printLn({
            en: "Usage: run <program>",
            zh: "用法: run <程序>",
        });

        return;
    }

    const node = vm.getFSNode(vm.resolvePath(FS.parsePath(args[1])));

    if (!node) {
        vm.printError({
            en: "Program not found.",
            zh: "未找到程序。",
        });
        return;
    }

    if (node.type !== "prog") {
        vm.printError({
            en: "Invalid Program.",
            zh: "程序无效。",
        });
        return;
    }

    node.code.forEach((c) => {
        switch (c.type) {
            case "exec":
                vm.printLn(`> ${c.command}`);
                vm.exec(c.command);
                break;
        }
    });
};

export default run;

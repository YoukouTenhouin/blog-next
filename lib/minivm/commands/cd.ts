import { CommandHandler } from "../commands";
import FS from "../fs";
import MiniVM from "../vm";

const cd: CommandHandler = (vm, input) => {
    const args = MiniVM.parseShellInput(input);

    if (args.length > 2) {
        // Usage
        vm.printLn({
            en: "Usage: cd <path>",
            zh: "用法: cd <路径>",
        });
        return;
    }

    if (args.length == 1) {
        vm.setCwd(["/"]);
        return;
    }

    let newCwd = vm.resolvePath(FS.parsePath(args[1]));

    // Check if path is valid
    if (vm.getFSNode(newCwd)?.type != "dir") {
        // Invalid
        vm.printError({
            en: "Invalid path.",
            zh: "无效路径。",
        });
        return;
    }

    vm.setCwd(newCwd);
};

export default cd;

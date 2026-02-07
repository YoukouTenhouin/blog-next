import { CommandHandler } from "../commands";
import FS from "../fs";
import MiniVM from "../vm";

const pwd: CommandHandler = (vm, input) => {
    const args = MiniVM.parseShellInput(input);

    if (args.length > 1) {
        vm.printLn({
            en: "Usage: pwd",
            zh: "用法: pwd",
        });
        return;
    }

    vm.printLn(FS.serializePath(vm.getCwd()));
};

export default pwd

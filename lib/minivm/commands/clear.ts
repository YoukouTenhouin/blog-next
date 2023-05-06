import { CommandHandler } from "../commands";
import MiniVM from "../vm";

const clear: CommandHandler = (vm, input) => {
  const args = MiniVM.parseShellInput(input);

  if (args.length > 1) {
    // Usage
    vm.printLn({
      en: "Usage: clear",
      cn: "用法: clear",
    });
    return;
  }

  vm.clearScreen();
};

export default clear;

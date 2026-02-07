import { CommandHandler } from "../commands";
import MiniVM from "../vm";

const help: CommandHandler = (vm, input) => {
    const args = MiniVM.parseShellInput(input);

    if (args.length > 1) {
        // Usage
        vm.printLn({
            en: "Usage: help",
            zh: "用法: help",
        });
        return;
    }

    const c = (name: string, en: string, zh?: string, clickable?: true) => {
        vm.printSection({
            type: "text",
            content: "\t",
        })
            .printSection({
                type: "text",
                content: name,
                commandOnClick: clickable && name,
            })
            .printSection({
                type: "text",
                content: {
                    en: en,
                    zh: zh,
                },
                alignment: 10,
            })
            .newLine();
    };

    vm.printLn({
        en: "Avaliable commands:",
        zh: "可用命令：",
    });

    c("cd", "Change current working directory", "切换当前目录");
    c("clear", "Clear Screen", "清空显示", true);
    c("ls", "List files in current directory", "列出目录下的文件", true);
    c("help", "List avaliable commands", "列出可用命令", true);
    c("pwd", "Show current working directory", "显示当前目录", true);
    c("run", "Run a program", "运行程序");
    c("show", "Show content of a file", "显示文件内容");
};

export default help;

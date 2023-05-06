import cd from "./commands/cd";
import clear from "./commands/clear";
import help from "./commands/help";
import ls from "./commands/ls";
import pwd from "./commands/pwd";
import run from "./commands/run";
import show from "./commands/show";
import MiniVM from "./vm";

export interface CommandHandler {
    (vm: MiniVM, input: string): void
}

export const commandHandlers: { [key: string]: CommandHandler } = {
    ls: ls,
    cd: cd,
    clear: clear,
    help: help,
    pwd: pwd,
    show: show,
    run: run
}
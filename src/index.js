import { Command } from "commander";
import add from "./commands/add.js";
import list from "./commands/list.js";
import update from "./commands/update.js";
import remove from "./commands/remove.js";
import { initStorage } from "./storage/jsonOps.js";

initStorage();

const program = new Command();

program.name("taskhub").version("1.0.0");
program.addCommand(add);
program.addCommand(list);
program.addCommand(update);
program.addCommand(remove);

program.parseAsync(process.argv);

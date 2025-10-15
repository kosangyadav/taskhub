import { Command } from "commander";
import { readTasks } from "../storage/jsonOps.js";

const listTasks = (detailed) => {
  const tasks = readTasks();
  if (tasks.length === 0) {
    console.log("No tasks found...");
    return;
  } else if (detailed) {
    console.log("ID\t\tTitle\t\tStatus\tCreated At");
    console.log("--\t\t-----\t\t------\t----------");
    tasks.forEach((task) => {
      console.log(
        `${task.id}\t${task.title}\t${task.status}\t${task.createdAt}`,
      );
    });
  } else {
    tasks.forEach((task) => {
      console.log(`${task.status} --> ${task.title}`);
    });
  }
};

const cmd = new Command("list")
  .description("List all tasks")
  .option("-l, --long", "shows detailed list...")
  .action((options) => {
    if (options.long) listTasks(true);
    else listTasks(false);
  });
export default cmd;

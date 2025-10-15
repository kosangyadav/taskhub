import { Command } from "commander";
import { readTasks } from "../storage/jsonOps.js";

const listTasks = (detailed) => {
  const tasks = readTasks();
  if (tasks.length === 0) {
    console.log("No tasks found...");
    return;
  } else if (detailed) {
    console.log(
      "ID".padEnd(4) + "TITLE".padEnd(50) + "STATUS".padEnd(12) + "CREATED AT",
    );
    console.log(
      "--".padEnd(4) + "-----".padEnd(50) + "------".padEnd(12) + "----------",
    );

    tasks.forEach((task) => {
      const title =
        task.title.length > 48 ? task.title.slice(0, 45) + "..." : task.title;

      console.log(
        String(task.id).padEnd(4) +
          title.slice(0, 48).padEnd(50) +
          task.status.padEnd(12) +
          task.createdAt,
      );
    });
    // console.log("ID\tTitle\t\t\t\tStatus\t\tCreated At");
    // console.log("--\t-----\t\t\t\t------\t\t----------");
    // tasks.forEach((task) => {
    //   console.log(
    //     `${task.id}\t${task.title}\t\t\t${task.status}\t\t${task.createdAt}`,
    //   );
    // });
  } else {
    tasks.forEach((task) => {
      console.log(`${task.status} --> ${task.title}`);
    });
  }
};

const listTask = (ID) => {
  const tasks = readTasks();
  const task = tasks[ID];
  if (!task) {
    console.log(`Task with ID ${ID} not found...`);
    return;
  }
  console.log("ID:          ", task.id);
  console.log("Title:       ", task.title);
  console.log("Description: ", task.description || "No description");
  console.log("Status:      ", task.status);
  console.log("Created At:  ", task.createdAt);
};

const cmd = new Command("list")
  .description("List all tasks")
  .argument("[ID]", "task ID to show detailed info")
  .option("-l, --long", "shows detailed list...")
  // .option("-i, --ID <ID>", "shows tasks with their IDs")
  .action((ID, options) => {
    if (ID) listTask(ID);
    else if (options.long) listTasks(true);
    else listTasks(false);
  });
export default cmd;

import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";

const removeTask = (ID) => {
  // Read existing tasks from storage
  const tasks = readTasks();
  // Validate ID
  if (isNaN(ID) || ID < 0 || ID >= tasks.length) {
    console.error("Invalid ID. Please provide a valid task ID.");
    return;
  }
  // remove the task
  ID = parseInt(ID, 10);
  const removedTask = tasks.splice(ID, 1);
  console.log(
    `Task removed: ${removedTask[0].title} (ID: ${removedTask[0].id})`,
  );
  // Reassign IDs to remaining tasks
  tasks.forEach((task, index) => {
    task.id = index;
  });
  // Write updated tasks back to storage
  writeTasks(tasks);
};

const removeAllTasks = () => {
  writeTasks([]);
  console.log("All tasks have been removed.");
};

const cmd = new Command("remove")
  .argument("[ID]", "task ID to remove")
  .option("-a, --all", "remove all tasks")
  .description("remove a task by ID or remove all tasks")
  .action((ID, options) => {
    if (ID && options.all) {
      console.error(
        "Please provide either an ID or the --all option, not both.",
      );
      return;
    } else if (!ID && !options.all) {
      console.error(
        "Please provide an ID or use the --all option to remove all tasks.",
      );
      return;
    } else if (ID) removeTask(ID);
    else if (options.all) removeAllTasks();
  });

export default cmd;

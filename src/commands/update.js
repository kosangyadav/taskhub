import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";

const cmd = new Command("update")
  .argument("<ID>", "task's id")
  .option("-s, --status <status>", "new status (todo | doing | done)")
  .option("-t, --title <title>", "new title for the task")
  .option("-d, --description <description>", "new description for the task")
  .description("Update a task's details with it's ID")
  .action((ID, options) => {
    if (!options.status && !options.title && !options.description) {
      console.error(
        "Please provide at least one option to update.\nUse options -t for title, -s for status or -d for description",
      );
      return;
    }
    updateTheTask(ID, options);
    console.log(`Task ID ${ID} updated...`);
  });

const updateTheTask = (ID, options) => {
  // Read existing tasks from storage
  const tasks = readTasks();

  // Validate ID
  if (isNaN(ID) || ID < 0 || ID >= tasks.length) {
    console.error("Invalid ID. Please provide a valid task ID.");
    return;
  }

  // Validate status if provided
  const validStatuses = ["todo", "doing", "done"];
  if (options.status && !validStatuses.includes(options.status)) {
    console.error(
      `Invalid status. Please use one of the following: ${validStatuses.join(
        ", ",
      )}.`,
    );
    return;
  }

  // Update the task
  ID = parseInt(ID, 10);

  tasks.splice(ID, 1, {
    ...tasks[ID],
    title: options.title || tasks[ID].title,
    status: options.status || tasks[ID].status,
    description: options.description || tasks[ID].description,
  });

  // Write updated tasks back to storage
  writeTasks(tasks);
};

export default cmd;

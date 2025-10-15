import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";

const addNewTask = async (title) => {
  const tasks = readTasks();
  const newTask = {
    id: Date.now(), // unique id (timestamp)
    title,
    status: "todo", // todo | doing | done
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  console.log(`Task added: ${title}`);
};

const cmd = new Command("add")
  .argument("<task-title>", "task title")
  .description("Add a new task")
  .action(async (title) => await addNewTask(title));

export default cmd;

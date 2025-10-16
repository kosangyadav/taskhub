import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";

const addNewTask = (title, description) => {
  const tasks = readTasks();
  const newTask = {
    // id: Date.now(), // unique id (timestamp)
    id: tasks.length, // unique id (timestamp)
    title,
    description: description || "",
    status: "todo", // todo | doing | done
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  console.log(`Task added: ${title}`);
};

const cmd = new Command("add")
  .argument("<task-title>", "task's title")
  .argument("[task-description]", "task's description")
  .description("Add a new task")
  .action((title, description = "") => addNewTask(title, description));

export default cmd;

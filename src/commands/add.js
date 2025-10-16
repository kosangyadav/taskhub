import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";

export const validateID = (ID, tasks) => {
  if (isNaN(ID) || ID < 0 || ID >= tasks.length) {
    console.error(ID, " is an invalid ID. Please provide a valid task ID.");
    return false;
  }
  return true;
};

const addTask = (title, description) => {
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

const addSubtask = (parentID, title) => {
  const tasks = readTasks();

  // Validate parentID
  if (!validateID(parentID, tasks)) return;

  const parentTask = tasks[parentID];
  if (!parentTask.subtasks) {
    parentTask.subtasks = [];
  }
  const newSubtask = {
    id: parentTask.subtasks.length,
    title,
    status: "todo",
    createdAt: new Date().toISOString(),
  };
  parentTask.subtasks.push(newSubtask);
  writeTasks(tasks);
  console.log(`Subtask added under Task ID ${parentID}: ${title}`);
};

const cmd = new Command("add")
  .argument("<task-title>", "task's title")
  .argument("[task-description]", "task's description")
  .option("--sub <parentID>", "add a subtask")
  .description("Add a new task or subtask")
  .action((title, description = "", options) => {
    // console.log({ options, title, description });
    if (options.sub) addSubtask(options.sub, title);
    else addTask(title, description);
  });

export default cmd;

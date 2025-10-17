import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import { validatePriority, validateStatus } from "./list.js";
import { coloredPriority, coloredStatus, colors } from "../utils/colors.js";

export const validateID = (ID, tasks) => {
  if (isNaN(ID) || ID < 0 || ID >= tasks.length) {
    console.error(ID, " is an invalid ID. Please provide a valid task ID.");
    return false;
  }
  return true;
};

const addTask = (title, description, options) => {
  const tasks = readTasks();

  // Validate status
  if (!validateStatus(options.status)) return;

  // Validate priority
  if (!validatePriority(options.priority)) return;

  const newTask = {
    // id: Date.now(), // unique id (timestamp)
    id: tasks.length, // unique id (timestamp)
    title,
    description: description || "",
    status: options.status, // todo | doing | done
    priority: options.priority, // low | medium | high
    due: options.due || null, // DD-MM-YYYY
    tags: options.tags ? options.tags.split(",") : [],
    subtasks: [],
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  // console.log(`Task added: ${title}`);
  console.log(`
${colors.success("✔ Task added successfully!")}
${colors.bold("Title:".padEnd(14))} ${colors.title(title)}
${colors.bold("Description:".padEnd(14))} ${colors.info(description || "No description")}
${colors.bold("Priority:".padEnd(14))} ${colors.error(coloredPriority(options.priority) || "medium")}
${colors.bold("Status:".padEnd(14))} ${colors.warn(coloredStatus(options.status) || "todo")}
${colors.bold("Due Date:".padEnd(14))} ${colors.error(options.due || "No due date")}
${colors.bold("Tags:".padEnd(14))} ${
    newTask.tags.length
      ? newTask.tags.map((tag) => colors.tag(tag.trim())).join(", ")
      : colors.meta("No tags")
  }
${colors.bold("Created at:".padEnd(14))} ${colors.meta(new Date().toLocaleString("ta-LK"))}
`);
};

const addSubtask = (parentID, title, options) => {
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
    status: options.status || "todo",
    createdAt: new Date().toISOString(),
  };
  parentTask.subtasks.push(newSubtask);
  writeTasks(tasks);
  // console.log(`Subtask added under Task ID ${parentID}: ${title}`);
  console.log(`${colors.success("✔ Subtask added successfully!")}
${colors.bold("Parent Task: ".padEnd(18))} ${colors.meta("[" + parentID + "]")} ${colors.title(parentTask.title)}
${colors.bold("Subtask Title:".padEnd(18))} ${colors.info(title)}
${colors.bold("Subtask Status:".padEnd(18))} ${colors.warn(coloredStatus(options.status)) || "todo"}
${colors.bold("Created at:".padEnd(18))} ${colors.meta(new Date().toLocaleString("ta-LK"))}
`);
};

const cmd = new Command("add")
  .argument("<task-title>", "task's title")
  .argument("[task-description]", "task's description")
  .option("--sub <parentID>", "add a subtask")
  .option(
    "-s, --status <status>",
    "set task status (todo, doing, done)",
    "todo",
  )
  .option(
    "-p, --priority <level>",
    "set task priority (low, medium, high)",
    "medium",
  )
  .option("-D, --due <date>", "set due date(DD-MM-YYYY)")
  .option("--tags <tags>", "comma-separated tags for the task")
  .description("Add a new task or subtask")
  .action((title, description = "", options) => {
    // console.log({ options, title, description });
    if (options.sub) addSubtask(options.sub, title, options);
    else addTask(title, description, options);
  });

export default cmd;

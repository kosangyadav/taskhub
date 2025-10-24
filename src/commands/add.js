import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import {
  validatePriority,
  validateStatus,
  validateID,
  validateSubtaskOptions,
} from "../utils/validation.js";
import {
  formatTaskCreated,
  formatSubtaskCreated,
} from "../utils/formatters.js";

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
    priority: options.priority, // noise | high | signal
    due: options.due || null, // DD-MM-YYYY
    tags: options.tags ? options.tags.split(",").map((tag) => tag.trim()) : [],
    subtasks: [],
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  console.log(formatTaskCreated(newTask, options));
};

const addSubtask = (parentID, title, options) => {
  const tasks = readTasks();

  // Validate subtask options first
  if (!validateSubtaskOptions(options)) return;

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
  console.log(formatSubtaskCreated(parentTask, parentID, title, options));
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
    "set task priority (noise, high, signal)",
    "high",
  )
  .option("-D, --due <date>", "set due date(DD-MM-YYYY)")
  .option("--tags <tags>", "comma-separated tags for the task")
  .description("Add a new task or subtask")
  .action((title, description = "", options, command) => {
    if (options.sub) {
      // For subtasks, check if unsupported options were explicitly provided
      const providedOptions = command.parent.rawArgs;
      const subtaskOptions = {
        status: options.status,
        // Only include other options if they were explicitly provided
        priority:
          providedOptions.includes("-p") ||
          providedOptions.includes("--priority")
            ? options.priority
            : undefined,
        due:
          providedOptions.includes("-D") || providedOptions.includes("--due")
            ? options.due
            : undefined,
        description:
          description && description.trim() ? description : undefined,
        tags: providedOptions.includes("--tags") ? options.tags : undefined,
      };
      addSubtask(options.sub, title, subtaskOptions);
    } else {
      addTask(title, description, options);
    }
  });

export default cmd;

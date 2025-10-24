import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import {
  validatePriority,
  validateStatus,
  validateID,
  validateDueDate,
  validateSubtaskOptions,
} from "../utils/validation.js";
import {
  formatTaskUpdated,
  formatSubtaskUpdated,
  formatError,
} from "../utils/formatters.js";

const cmd = new Command("update")
  .argument("<ID>", "task's id")
  .option(
    "--sub",
    "update a subtask's details with it's ID in format: [pID.sID] :: pID -> parentTaskID, sID -> subtaskID",
  )
  .option("-s, --status <status>", "new status (todo | doing | done)")
  .option("-t, --title <title>", "new title for the task")
  .option("-d, --description <description>", "new description for the task")
  .option("-p, --priority <priority>", "new priority for the task")
  .option("-D, --due <due>", "new due date for the task in format: DD-MM-YYYY")
  .option(
    "--tags <tags>",
    "comma-separated tags for the task (e.g., tag1,tag2)",
  )
  .description("Update a task's details with it's ID")
  .action((ID, options) => {
    if (
      !options.status &&
      !options.title &&
      !options.description &&
      !options.priority &&
      !options.due &&
      !options.tags
    ) {
      console.error(
        formatError(
          "Please provide at least one option to update a task...\nUse options -t for title, -s for status or -d for description",
        ),
      );
      return;
    }

    // Validate due date if provided
    if (options.due && !validateDueDate(options.due)) {
      return;
    }

    updateTheTask(ID, options);
  });

const updateTheTask = (ID, options) => {
  // Read existing tasks from storage
  const tasks = readTasks();

  // Validate status if provided
  if (options.status) if (!validateStatus(options.status)) return;

  // Validate ID for subtasks and update the subtasks
  if (options.sub) {
    // Validate subtask options first
    if (!validateSubtaskOptions(options)) return;

    const ids = ID.split(".");
    if (ids.length !== 2) {
      console.error(
        formatError(
          "invalid format. Use [pID.sID] (e.g., 3.1) → pID = parent task ID, sID = subtask ID.",
        ),
      );
      return;
    }
    const [pID, sID] = ids;
    if (!validateID(pID, tasks)) return;
    if (!tasks[pID].subtasks || !validateID(sID, tasks[pID].subtasks)) {
      // console.error(
      //   colors.error(
      //     sID + " is an invalid subtask ID. Please provide a valid subtask ID.",
      //   ),
      // );
      console.log(
        formatError(
          `error: Subtask ID ${sID} not found. Check available IDs and try again.`,
        ),
      );
      return;
    }
    // Update the subtask
    const pIDInt = parseInt(pID, 10);
    const sIDInt = parseInt(sID, 10);

    tasks[pIDInt].subtasks.splice(sIDInt, 1, {
      ...tasks[pIDInt].subtasks[sIDInt],
      title: options.title || tasks[pIDInt].subtasks[sIDInt].title,
      status: options.status || tasks[pIDInt].subtasks[sIDInt].status,
      // description:
      //   options.description || tasks[pIDInt].subtasks[sIDInt].description,
    });

    // console.log(
    // colors.success(`✔ Subtask ID ${sID} under Task ID ${pID} updated...`),
    // );
    console.log(formatSubtaskUpdated(sID, pID));
  } else {
    // Validate ID for main tasks
    if (!validateID(ID, tasks)) return;

    if (options.priority && !validatePriority(options.priority)) return;

    // Update the main tasks
    ID = parseInt(ID, 10);

    tasks.splice(ID, 1, {
      ...tasks[ID],
      // title: options.title || tasks[ID].title,
      // status: options.status || tasks[ID].status,
      // description: options.description || tasks[ID].description,
      // priority: options.priority || tasks[ID].priority,
      // due: options.due || tasks[ID].due,
      ...options,
      tags: options.tags ? options.tags.split(",") : tasks[ID].tags,
      // Keep existing subtasks if any
      subtasks: tasks[ID].subtasks || [],
    });

    console.log(formatTaskUpdated(ID));
  }

  // Write updated tasks back to storage
  writeTasks(tasks);
};

export default cmd;

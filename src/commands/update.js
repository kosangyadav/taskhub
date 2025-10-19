import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import { validatePriority, validateStatus } from "./list.js";
import { validateID } from "./add.js";
import { colors } from "../utils/colors.js";

/**
 * Validates due date format (DD-MM-YYYY)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateDueDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    console.error(
      colors.error("✘ Due date cannot be empty. Use format: DD-MM-YYYY"),
    );
    return false;
  }

  // Check format DD-MM-YYYY
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(dateStr)) {
    console.error(
      colors.error(
        `✘ Invalid date format: ${dateStr}. Please use DD-MM-YYYY format (e.g., 25-12-2024)`,
      ),
    );
    return false;
  }

  // Parse and validate the date
  const parts = dateStr.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Basic range validation
  if (day < 1 || day > 31) {
    console.error(
      colors.error(`✘ Invalid day: ${day}. Day must be between 1 and 31`),
    );
    return false;
  }

  if (month < 1 || month > 12) {
    console.error(
      colors.error(`✘ Invalid month: ${month}. Month must be between 1 and 12`),
    );
    return false;
  }

  if (year < 1900 || year > 2100) {
    console.error(
      colors.error(
        `✘ Invalid year: ${year}. Year must be between 1900 and 2100`,
      ),
    );
    return false;
  }

  // Check if the date is actually valid (handles cases like 31-02-2024)
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    console.error(
      colors.error(
        `✘ Invalid date: ${dateStr}. This date does not exist in the calendar`,
      ),
    );
    return false;
  }

  return true;
};

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
        colors.error(
          "✘ Please provide at least one option to update a task...\nUse options -t for title, -s for status or -d for description",
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
    if (options.description) {
      console.error(
        colors.error("✘ Subtasks doesn't support description yet..."),
      );
      console.error(
        colors.error(
          "so, please add or update the title and status of subtasks...",
        ),
      );
      return;
    }

    const ids = ID.split(".");
    if (ids.length !== 2) {
      console.error(
        colors.error(
          "✘ invalid format. Use [pID.sID] (e.g., 3.1) → pID = parent task ID, sID = subtask ID.",
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
        colors.error(
          `✘ error: Subtask ID ${sID} not found. Check available IDs and try again.`,
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
    console.log(
      colors.success(`✔ Updated subtask #${sID} under task #${pID}.`),
    );
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

    console.log(colors.success(`✔ Task ID ${ID} updated successfully...`));
  }

  // Write updated tasks back to storage
  writeTasks(tasks);
};

export default cmd;

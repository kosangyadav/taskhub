import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import { validateID } from "../utils/validation.js";
import { colors } from "../utils/colors.js";
import {
  confirmAction,
  confirmDangerousAction,
  showCancellationMessage,
} from "../utils/prompt.js";
import {
  formatTaskRemoved,
  formatSubtaskRemoved,
  formatError,
  formatInfo,
  formatSuccess,
} from "../utils/formatters.js";

const removeTask = async (ID, options) => {
  // Read existing tasks from storage
  const tasks = readTasks();

  // Validate ID for subtasks and remove the subtasks
  if (options.sub) {
    const ids = ID.split(".");
    if (ids.length !== 2) {
      console.error(
        formatError(
          "Invalid format.\nUse: [pID.sID] (e.g., 3.1)\n→ pID = parent task ID, sID = subtask ID.",
        ),
      );
      return;
    }
    const [pID, sID] = ids;
    if (!validateID(pID, tasks)) return;
    if (!tasks[pID].subtasks || !validateID(sID, tasks[pID].subtasks)) {
      console.error(
        formatError(
          `error: Subtask ID ${sID} not found. Check available IDs and try again.`,
        ),
      );
      return;
    }
    // Update the subtask
    const pIDInt = parseInt(pID, 10);
    const sIDInt = parseInt(sID, 10);
    const subtaskToRemove = tasks[pIDInt].subtasks[sIDInt];

    // Confirm removal (unless --force or --yes is used)
    if (!options.force && !options.yes) {
      const confirmed = await confirmAction(
        `Remove subtask "${colors.title(subtaskToRemove.title)}" from task "${colors.title(tasks[pIDInt].title)}"?`,
        false,
      );

      if (!confirmed) {
        showCancellationMessage();
        return;
      }
    }

    // remove the subtask
    const removedSubtask = tasks[pIDInt].subtasks.splice(sIDInt, 1);

    console.log(formatSubtaskRemoved(removedSubtask[0], pIDInt));

    // Reassign IDs to remaining subtasks
    tasks[pIDInt].subtasks.forEach((subtask, index) => {
      subtask.id = index;
    });
  } else {
    // Validate ID
    if (!validateID(ID, tasks)) return;

    ID = parseInt(ID, 10);
    const taskToRemove = tasks[ID];
    const hasSubtasks =
      taskToRemove.subtasks && taskToRemove.subtasks.length > 0;

    // Show what will be removed
    let confirmMessage = `Remove task "${colors.title(taskToRemove.title)}"?`;
    if (hasSubtasks) {
      confirmMessage = `Remove task "${colors.title(taskToRemove.title)}" and its ${colors.warn(taskToRemove.subtasks.length)} subtask(s)?`;
    }

    // Confirm removal (unless --force or --yes is used)
    if (!options.force && !options.yes) {
      const confirmed = await confirmAction(confirmMessage, false);

      if (!confirmed) {
        showCancellationMessage();
        return;
      }
    }

    // remove the task
    const removedTask = tasks.splice(ID, 1);

    console.log(formatTaskRemoved(removedTask[0]));
    // Reassign IDs to remaining tasks
    tasks.forEach((task, index) => {
      task.id = index;
    });
  }

  // Write updated tasks back to storage
  writeTasks(tasks);
};

const removeAllTasks = async (force = false) => {
  const tasks = readTasks();

  if (tasks.length === 0) {
    console.log(formatInfo("No tasks to remove.\n"));
    return;
  }

  // Confirm removal (unless --force or --yes is used)
  if (!force) {
    const totalSubtasks = tasks.reduce(
      (sum, task) => sum + (task.subtasks ? task.subtasks.length : 0),
      0,
    );
    let itemDescription = `${tasks.length} task(s)`;
    if (totalSubtasks > 0) {
      itemDescription += ` and ${totalSubtasks} subtask(s)`;
    }

    const confirmed = await confirmDangerousAction(
      "remove all tasks",
      itemDescription,
    );

    if (!confirmed) {
      showCancellationMessage();
      return;
    }
  }

  writeTasks([]);

  console.log(formatSuccess("Success: All tasks have been removed.\n"));
};

const cmd = new Command("remove")
  .argument("[ID]", "task ID to remove")
  .option(
    "--sub",
    "remove a subtask's details with it's ID in format: [pID.sID] :: pID -> parentTaskID, sID -> subtaskID",
  )
  .option("-a, --all", "remove all tasks")
  .option("-f, --force", "skip confirmation prompts")
  .option("-y, --yes", "automatically answer yes to all prompts")
  .description("remove a task by ID or remove all tasks")
  .action(async (ID, options) => {
    if (ID && options.all) {
      console.error(
        formatError(
          "Please provide either a task ID or the --all option, not both.\n",
        ),
      );
      return;
    } else if (!ID && !options.all) {
      console.error(
        formatError(
          "Please provide a task ID or use the --all option to remove all tasks.",
        ),
      );
      return;
    } else if (ID) await removeTask(ID, options);
    else if (options.all) await removeAllTasks(options.force || options.yes);
  });

export default cmd;

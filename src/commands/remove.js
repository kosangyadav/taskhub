import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import { validateID } from "./add.js";
import { colors } from "../utils/colors.js";

const removeTask = (ID, options) => {
  // Read existing tasks from storage
  const tasks = readTasks();

  // Validate ID for subtasks and remove the subtasks
  if (options.sub) {
    const ids = ID.split(".");
    if (ids.length !== 2) {
      console.error(
        colors.error(
          "✘ Invalid format.\nUse: [pID.sID] (e.g., 3.1)\n→ pID = parent task ID, sID = subtask ID.",
        ),
      );
      return;
    }
    const [pID, sID] = ids;
    if (!validateID(pID, tasks)) return;
    if (!tasks[pID].subtasks || !validateID(sID, tasks[pID].subtasks)) {
      console.error(
        colors.error(
          `✘ error: Subtask ID ${sID} not found. Check available IDs and try again.`,
        ),
      );
      return;
    }
    // Update the subtask
    const pIDInt = parseInt(pID, 10);
    const sIDInt = parseInt(sID, 10);

    // remove the subtask
    const removedSubtask = tasks[pIDInt].subtasks.splice(sIDInt, 1);

    console.log(
      colors.success(
        `✔ Removed subtask "${removedSubtask[0].title}" (ID: ${removedSubtask[0].id}) from task ${pIDInt}.`,
      ),
    );

    // Reassign IDs to remaining subtasks
    tasks[pIDInt].subtasks.forEach((subtask, index) => {
      subtask.id = index;
    });
  } else {
    // Validate ID
    if (!validateID(ID, tasks)) return;

    // remove the task
    ID = parseInt(ID, 10);
    const removedTask = tasks.splice(ID, 1);

    console.log(
      colors.success(
        `✔ Removed task "${removedTask[0].title}" (ID: ${removedTask[0].id}).`,
      ),
    );
    // Reassign IDs to remaining tasks
    tasks.forEach((task, index) => {
      task.id = index;
    });
  }

  // Write updated tasks back to storage
  writeTasks(tasks);
};

const removeAllTasks = () => {
  writeTasks([]);

  console.log(colors.success("✔ Success: All tasks have been removed."));
};

const cmd = new Command("remove")
  .argument("[ID]", "task ID to remove")
  .option(
    "--sub",
    "remove a subtask's details with it's ID in format: [pID.sID] :: pID -> parentTaskID, sID -> subtaskID",
  )
  .option("-a, --all", "remove all tasks")
  .description("remove a task by ID or remove all tasks")
  .action((ID, options) => {
    if (ID && options.all) {
      console.error(
        colors.error(
          "✖ Please provide either a task ID or the --all option, not both.",
        ),
      );
      return;
    } else if (!ID && !options.all) {
      console.error(
        colors.error(
          "✖ Please provide a task ID or use the --all option to remove all tasks.",
        ),
      );
      return;
    } else if (ID) removeTask(ID, options);
    else if (options.all) removeAllTasks();
  });

export default cmd;

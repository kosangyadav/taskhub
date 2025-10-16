import { Command } from "commander";
import { readTasks, writeTasks } from "../storage/jsonOps.js";
import { validateID } from "./add.js";

const removeTask = (ID, options) => {
  // Read existing tasks from storage
  const tasks = readTasks();

  // Validate ID for subtasks and remove the subtasks
  if (options.sub) {
    const ids = ID.split(".");
    if (ids.length !== 2) {
      console.error(
        "For removing a subtask, please provide ID in format: [pID.sID] :: pID -> parentTaskID, sID -> subtaskID",
      );
      return;
    }
    const [pID, sID] = ids;
    if (!validateID(pID, tasks)) return;
    if (!tasks[pID].subtasks || !validateID(sID, tasks[pID].subtasks)) {
      console.error(
        sID + " is an invalid subtask ID. Please provide a valid subtask ID.",
      );
      return;
    }
    // Update the subtask
    const pIDInt = parseInt(pID, 10);
    const sIDInt = parseInt(sID, 10);

    // remove the subtask
    const removedSubtask = tasks[pIDInt].subtasks.splice(sIDInt, 1);

    console.log(
      `Subtask removed: ${removedSubtask[0].title} [ID: ${removedSubtask[0].id}] from Task ID: ${pIDInt}`,
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
      `Task removed: ${removedTask[0].title} [ID: ${removedTask[0].id}]`,
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
  console.log("All tasks have been removed.");
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
        "Please provide either an ID or the --all option, not both.",
      );
      return;
    } else if (!ID && !options.all) {
      console.error(
        "Please provide an ID or use the --all option to remove all tasks.",
      );
      return;
    } else if (ID) removeTask(ID, options);
    else if (options.all) removeAllTasks();
  });

export default cmd;

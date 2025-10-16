import { Command } from "commander";
import { readTasks } from "../storage/jsonOps.js";

export const validateStatus = (status) => {
  const validStatuses = ["todo", "doing", "done"];
  if (!validStatuses.includes(status)) {
    console.error(
      `Invalid status. Please use one of the following: ${validStatuses.join(
        ", ",
      )}.`,
    );
    return false;
  } else return true;
};

export const validatePriority = (priority) => {
  const validPriorities = ["low", "medium", "high", "top", "signal"];
  if (!validPriorities.includes(priority)) {
    console.error(
      `Invalid priority. Please use one of the following: ${validPriorities.join(
        ", ",
      )}.`,
    );
    return false;
  } else return true;
};

const listTasks = (detailed, options) => {
  let tasks = readTasks();

  if (options.status) {
    if (!validateStatus(options.status)) return;
    tasks = tasks.filter((task) => task.status == options.status);
  }

  if (options.priority) {
    if (!validatePriority(options.priority)) return;
    tasks = tasks.filter((task) => task.priority == options.priority);
  }

  if (options.due)
    tasks = tasks.filter((task) => task.due && task.due == options.due);

  if (options.tags) {
    const tags = options.tags.split(",").map((tag) => tag.trim().toLowerCase());
    tasks = tasks.filter(
      (task) =>
        task.tags &&
        tags.every((tag) =>
          task.tags.map((t) => t.toLowerCase()).includes(tag),
        ),
    );
  }

  if (options.find)
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(options.find.toLowerCase()) ||
        task.description.toLowerCase().includes(options.find.toLowerCase()),
    );

  if (tasks.length === 0) {
    console.log("No tasks found...");
    return;
  } else if (detailed) {
    console.log(
      "ID".padEnd(4) +
        "PRIORITY".padEnd(10) +
        "DUE DATE".padEnd(12) +
        "TITLE".padEnd(50) +
        "SUB".padEnd(5) +
        "STATUS".padEnd(8) +
        "TAGS".padEnd(16) +
        "CREATED AT",
    );
    console.log(
      "--".padEnd(4) +
        "--------".padEnd(10) +
        "--- ----".padEnd(12) +
        "-----".padEnd(50) +
        "---".padEnd(5) +
        "------".padEnd(8) +
        "----".padEnd(16) +
        "----------",
    );

    tasks.forEach((task) => {
      const title =
        task.title.length > 48 ? task.title.slice(0, 45) + "..." : task.title;

      const tags = task.tags
        ? task.tags.length > 2
          ? task.tags.slice(0, 2).join(", ") + ",..."
          : task.tags.join(", ")
        : "No Tags";

      console.log(
        String(task.id).padEnd(4) +
          (task.priority ? task.priority : "medium").padEnd(10) +
          (task.due ? task.due : "N/A").padEnd(12) +
          title.slice(0, 48).padEnd(50) +
          String(task.subtasks ? task.subtasks.length : 0).padEnd(5) +
          task.status.padEnd(8) +
          tags.padEnd(16) +
          task.createdAt,
      );
    });
    // console.log("ID\tTitle\t\t\t\tStatus\t\tCreated At");
    // console.log("--\t-----\t\t\t\t------\t\t----------");
    // tasks.forEach((task) => {
    //   console.log(
    //     `${task.id}\t${task.title}\t\t\t${task.status}\t\t${task.createdAt}`,
    //   );
    // });
  } else {
    tasks.forEach((task) => {
      console.log(
        `[${task.id}]${task.status} --> ${task.title} --> ${task.subtasks ? task.subtasks.length : 0} subtasks`,
      );
    });
  }
};

const listTask = (ID) => {
  const tasks = readTasks();
  const task = tasks[ID];
  if (!task) {
    console.log(`Task with ID ${ID} not found...`);
    return;
  }
  console.log("ID:          ", task.id);
  console.log("Priority:    ", task.priority);
  console.log("Due Date:    ", task.due || "No due date");
  console.log("Title:       ", task.title);
  console.log("Description: ", task.description || "No description");
  console.log("Status:      ", task.status);
  console.log(
    "Tags:        ",
    task.tags && 0 < task.tags.length ? task.tags.join(", ") : "No tags",
  );
  console.log("Created At:  ", task.createdAt);

  if (Array.isArray(task.subtasks) && 0 < task.subtasks.length) {
    console.log("\nSubTasks...");

    task.subtasks.forEach((subtask) => {
      console.log(`   [${subtask.id}] ${subtask.title}`);
      console.log(`       Status: ${subtask.status}\n`);
    });
  }
};

const cmd = new Command("list")
  .description("List all tasks")
  .argument("[ID]", "task ID to show detailed info")
  .option("-l, --long", "shows detailed list...")
  .option("-s, --status <status>", "shows filtered list based on status")
  .option("-p, --priority <priority>", "shows filtered list based on priority")
  .option("-D, --due <due>", "shows filtered list based on due date")
  .option(
    "--tags <tags>",
    "shows filtered list based on tags (comma separated)",
  )
  .option(
    "-f, --find <keywords>",
    "shows filtered list based on keywords for title or description",
  )
  // .option("-i, --ID <ID>", "shows tasks with their IDs")
  .action((ID, options) => {
    if (ID) listTask(ID);
    else if (options.long) listTasks(true, options);
    else listTasks(false, options);
  });
export default cmd;

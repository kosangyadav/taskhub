import { Command } from "commander";
import { readTasks } from "../storage/jsonOps.js";
import { colors, getStatusIcon, getPriorityIcon } from "../utils/colors.js";
import { validateID } from "../utils/validation.js";
import { formatRelativeTime } from "../utils/timeUtils.js";
import { renderTaskCard } from "../utils/taskDisplay.js";
import {
  renderTaskTable,
  renderFilterSummary,
  renderTaskSummary,
  renderNoTasksMessage,
} from "../utils/tableRenderer.js";

import { filterTasks } from "../utils/taskFilters.js";
import { smartSortTasks } from "../../sortList.js";

const listTasks = (detailed, options) => {
  const allTasks = readTasks();

  // Apply filters
  const filteredTasks = filterTasks(allTasks, options);
  if (filteredTasks === null) return; // Validation failed

  // Apply smart sorting
  const tasks = smartSortTasks(filteredTasks);

  // Display results
  if (tasks.length === 0) {
    renderNoTasksMessage();
    return;
  }

  // Show filter summary
  renderFilterSummary(tasks.length, options);

  if (detailed) {
    // Detailed table view
    renderTaskTable(tasks);
  } else {
    // Simple compact list
    tasks.forEach((task) => {
      const title =
        task.title.length > 50 ? task.title.slice(0, 47) + "..." : task.title;
      const subtasks =
        task.subtasks?.length > 0 ? ` [${task.subtasks.length}]` : "";
      const due = task.due ? ` • ${formatRelativeTime(task.due)}` : "";
      const tags =
        task.tags?.length > 0
          ? ` • ${task.tags
              .slice(0, 2)
              .map((t) => `#${t}`)
              .join(
                " ",
              )}${task.tags.length > 2 ? " +" + (task.tags.length - 2) : ""}`
          : "";

      console.log(
        `${colors.meta(String(task.id).padStart(2) + ".")} ${colors.warn(getPriorityIcon(task.priority || "high"))} ${getStatusIcon(task.status)} ${colors.title(title)}${colors.info(subtasks)}${colors.meta(due)}${colors.tag(tags)}`,
      );
    });
  }

  // Summary footer
  renderTaskSummary(tasks);
};

const listTask = (ID) => {
  const tasks = readTasks();
  if (!validateID(ID, tasks)) return;
  const task = tasks[ID];
  renderTaskCard(task);
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

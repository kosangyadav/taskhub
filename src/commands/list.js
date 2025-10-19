import { Command } from "commander";
import { readTasks } from "../storage/jsonOps.js";

import {
  bgColors,
  coloredPriority,
  coloredStatus,
  colors,
} from "../utils/colors.js";
import { validateID } from "./add.js";
import {
  stripAnsi,
  getDisplayLength,
  wrapText,
  createCardLine,
  createMultiLineContent,
  createBorder,
} from "../utils/textUtils.js";

import {
  formatRelativeTime,
  formatCreatedDate,
  formatCompleteDueDate,
  getDueDateColor,
  isOverdue,
  isDueSoon,
  getUrgencyMessage,
  getHeaderUrgencyIndicator,
} from "../utils/timeUtils.js";

export const validateStatus = (status) => {
  const validStatuses = ["todo", "doing", "done"];
  if (!validStatuses.includes(status)) {
    console.error(
      colors.error(
        `✘ invalid status. Please use one of the following: ${validStatuses.join(
          ", ",
        )}.`,
      ),
    );
    return false;
  } else return true;
};

export const validatePriority = (priority) => {
  const validPriorities = ["noise", "high", "signal"];
  if (!validPriorities.includes(priority)) {
    console.error(
      colors.error(
        `✘ invalid priority. Please use one of the following: ${validPriorities.join(
          ", ",
        )}.`,
      ),
    );
    return false;
  } else return true;
};

const getStatusIcon = (status) => {
  switch (status) {
    case "todo":
      return "○";
    case "doing":
      return "◐";
    // return "◑";
    case "done":
      return "●";
    default:
      return "○";
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case "noise":
      return "0";
    case "high":
      return "1";
    case "signal":
      return "#";
    default:
      return "1";
  }
};

const listTasks = (detailed, options) => {
  let tasks = readTasks();

  // Apply filters
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

  // Display results
  if (tasks.length === 0) {
    console.log(`\n${colors.error("✘ No tasks found")}`);
    console.log(
      colors.meta("Try adjusting your filters or add some tasks first."),
    );
    return;
  }

  // Show filter summary if any filters are applied
  const activeFilters = [];
  if (options.status)
    activeFilters.push(`status: ${colors.warn(options.status)}`);
  if (options.priority)
    activeFilters.push(`priority: ${colors.info(options.priority)}`);
  if (options.due) activeFilters.push(`due: ${colors.meta(options.due)}`);
  if (options.tags) activeFilters.push(`tags: ${colors.tag(options.tags)}`);
  if (options.find) activeFilters.push(`search: ${colors.title(options.find)}`);

  console.log(
    `\n${colors.success("✔")} Found ${colors.bold(tasks.length)} task${tasks.length === 1 ? "" : "s"}${activeFilters.length > 0 ? ` with filters: ${activeFilters.join(", ")}` : ""}\n`,
  );

  if (detailed) {
    // Detailed table view
    console.log(
      colors.title(
        "┌────┬──────────┬─────────────┬──────────────────────────────────────────────────┬─────┬────────┬──────────────────────┐",
      ),
    );
    console.log(
      colors.title(
        "│ ID │ PRIORITY │   DUE DATE  │                      TITLE                       │ SUB │ STATUS │      TAGS            │",
      ),
    );
    console.log(
      colors.title(
        "├────┼──────────┼─────────────┼──────────────────────────────────────────────────┼─────┼────────┼──────────────────────┤",
      ),
    );

    tasks.forEach((task, index) => {
      const title =
        task.title.length > 48 ? task.title.slice(0, 45) + "..." : task.title;
      const tags =
        task.tags && task.tags.length > 0
          ? task.tags.length > 2
            ? task.tags[0] + task.tags[1] < 20
              ? task.tags.slice(0, 2).join(",") + "..."
              : task.tags[0] + "..."
            : task.tags.join(",")
          : "";

      const statusIcon = getStatusIcon(task.status);
      const priorityIcon = getPriorityIcon(task.priority || "high");
      const subtaskCount = task.subtasks ? task.subtasks.length : 0;
      const priority = (task.priority || "high").slice(0, 6).padEnd(6);
      const status = task.status.slice(0, 5).padEnd(5);
      const dueDateClean = task.due || "No due date";

      console.log(
        `│ ${colors.meta(String(task.id).padEnd(2))} │ ${priorityIcon} ${coloredPriority(priority)} │ ${colors.meta(dueDateClean.padEnd(11))} │ ${colors.title(title.padEnd(48))} │ ${colors.info(String(subtaskCount).padEnd(3))} │ ${statusIcon} ${coloredStatus(task.status)}${task.status === "doing" ? "" : " "}│ ${colors.tag(tags.padEnd(20))} │`,
      );

      if (index < tasks.length - 1) {
        console.log(
          colors.title(
            "├────┼──────────┼─────────────┼──────────────────────────────────────────────────┼─────┼────────┼──────────────────────┤",
          ),
        );
      }
    });

    console.log(
      colors.title(
        "└────┴──────────┴─────────────┴──────────────────────────────────────────────────┴─────┴────────┴──────────────────────┘",
      ),
    );
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
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const summaryParts = [];
  if (statusCounts.todo)
    summaryParts.push(`${colors.error(statusCounts.todo)} todo`);
  if (statusCounts.doing)
    summaryParts.push(`${colors.warn(statusCounts.doing)} doing`);
  if (statusCounts.done)
    summaryParts.push(`${colors.success(statusCounts.done)} done`);

  console.log(`\n${colors.meta("Summary:")} ${summaryParts.join(" • ")}\n`);
};

const listTask = (ID) => {
  const tasks = readTasks();
  if (!validateID(ID, tasks)) return;
  const task = tasks[ID];
  if (!task) {
    console.log(`${colors.error("✘")} Task with ID ${ID} not found...`);
    return;
  }

  const statusIcon = getStatusIcon(task.status);
  const priorityIcon = getPriorityIcon(task.priority || "high");
  const dueDate = formatRelativeTime(task.due);
  const completeDueDate = formatCompleteDueDate(task.due);
  const dueDateColor = getDueDateColor(task.due);

  // Dynamic card width based on content
  const contentLines = [
    `ID: ${task.id}`,
    `Title: ${task.title}`,
    task.description ? `Description: ${task.description}` : null,
    `Status: ${statusIcon} ${task.status}`,
    `Priority: ${priorityIcon} ${task.priority || "high"}`,
    `Due Date: ${stripAnsi(completeDueDate)}`,
    `Tags: ${task.tags && task.tags.length > 0 ? task.tags.map((tag) => `#${tag}`).join(" ") : "No tags"}`,
    `Created: ${formatCreatedDate(task.createdAt)} (${new Date(task.createdAt).toLocaleDateString()})`,
  ].filter(Boolean);

  // Find the longest line for dynamic width (max 80 chars)
  const maxContentLength = Math.max(
    ...contentLines.map((line) => getDisplayLength(line)),
    30, // minimum width
  );
  const cardWidth = Math.min(maxContentLength + 4, 88);
  const contentWidth = cardWidth - 4;
  const maxLabelWidth = 12;
  const textWidth = contentWidth - maxLabelWidth;

  // Add urgency indicator to header if task has due date
  const headerSuffix = getHeaderUrgencyIndicator(task.due);

  // Card-style layout with dynamic width
  console.log(
    `\n${colors.title(`┌─ Task Details ${createBorder("─", cardWidth - 15)}┐`)}${headerSuffix}`,
  );
  console.log(createCardLine("", contentWidth));
  console.log(
    createCardLine(
      `${colors.bold("ID:")} ${colors.meta(task.id)}`,
      contentWidth,
      true,
    ),
  );

  // Multi-line title
  const titleLines = createMultiLineContent(
    "Title",
    task.title,
    textWidth,
    colors.title,
  );
  titleLines.forEach((line) =>
    console.log(createCardLine(line, contentWidth, true)),
  );
  console.log(createCardLine("", contentWidth));

  // Multi-line description
  if (task.description) {
    const descriptionLines = createMultiLineContent(
      "Description",
      task.description,
      textWidth,
      colors.info,
    );
    descriptionLines.forEach((line) =>
      console.log(createCardLine(line, contentWidth, true)),
    );
    console.log(createCardLine("", contentWidth));
  }

  // Status with multi-line support if needed
  const statusText = `Status: ${statusIcon} ${task.status}`;
  const statusLines = wrapText(statusText, contentWidth);
  statusLines.forEach((line, index) => {
    if (index === 0) {
      console.log(
        createCardLine(
          `${colors.bold("Status:")} ${statusIcon} ${coloredStatus(task.status)}`,
          contentWidth,
          true,
        ),
      );
    } else {
      console.log(createCardLine(`        ${line}`, contentWidth, true));
    }
  });

  // Priority with multi-line support if needed
  const priorityText = `Priority: ${priorityIcon} ${task.priority || "high"}`;
  const priorityLines = wrapText(priorityText, contentWidth);
  priorityLines.forEach((line, index) => {
    if (index === 0) {
      console.log(
        createCardLine(
          `${colors.bold("Priority:")} ${priorityIcon} ${coloredPriority(task.priority || "high")}`,
          contentWidth,
          true,
        ),
      );
    } else {
      console.log(createCardLine(`          ${line}`, contentWidth, true));
    }
  });

  // Due date with enhanced single-line display and color coding
  if (task.due) {
    // Try to keep due date on single line if it fits
    const cleanCompleteDueDate = stripAnsi(completeDueDate);
    if (getDisplayLength(`Due Date: ${cleanCompleteDueDate}`) <= contentWidth) {
      // Single line display
      console.log(
        createCardLine(
          `${colors.bold("Due Date:")} ${completeDueDate}`,
          contentWidth,
          true,
        ),
      );
    } else {
      // Fall back to multi-line if absolutely necessary
      const dueDateLines = wrapText(cleanCompleteDueDate, textWidth);
      dueDateLines.forEach((line, index) => {
        if (index === 0) {
          const coloredLine =
            line === cleanCompleteDueDate
              ? completeDueDate
              : dueDateColor(line);
          console.log(
            createCardLine(
              `${colors.bold("Due Date:")} ${coloredLine}`,
              contentWidth,
              true,
            ),
          );
        } else {
          const padding = " ".repeat("Due Date:".length + 1);
          console.log(
            createCardLine(
              `${padding}${dueDateColor(line)}`,
              contentWidth,
              true,
            ),
          );
        }
      });
    }

    // Add urgency message if applicable
    const urgencyMessage = getUrgencyMessage(task.due);
    if (urgencyMessage) {
      const cleanUrgencyMessage = stripAnsi(urgencyMessage);
      if (getDisplayLength(`Urgency: ${cleanUrgencyMessage}`) <= contentWidth) {
        // Single line urgency message
        console.log(
          createCardLine(
            `${colors.bold("Urgency:")} ${urgencyMessage}`,
            cleanUrgencyMessage === "⏰ Due very soon!"
              ? contentWidth - 1
              : contentWidth,
            true,
          ),
        );
      } else {
        // Multi-line urgency message if too long
        const urgencyLines = wrapText(cleanUrgencyMessage, textWidth);
        urgencyLines.forEach((line, index) => {
          if (index === 0) {
            console.log(
              createCardLine(
                `${colors.bold("Urgency:")} ${urgencyMessage}`,
                contentWidth,
                true,
              ),
            );
          } else {
            const padding = " ".repeat("Urgency:".length + 1);
            console.log(
              createCardLine(`${padding}${line}`, contentWidth, true),
            );
          }
        });
      }
    }
  } else {
    // No due date case
    console.log(
      createCardLine(
        `${colors.bold("Due Date:")} ${colors.meta("No due date set")}`,
        contentWidth,
        true,
      ),
    );
  }

  // Tags with multi-line support
  const tagText =
    task.tags && task.tags.length > 0
      ? task.tags.map((tag) => `#${tag}`).join(" ")
      : "No tags";
  const tagLines = createMultiLineContent(
    "Tags",
    tagText,
    textWidth,
    (text) => {
      return task.tags && task.tags.length > 0
        ? text
            .split(" ")
            .map((tag) => colors.tag(tag))
            .join(" ")
        : colors.meta(text);
    },
  );
  tagLines.forEach((line) =>
    console.log(createCardLine(line, contentWidth, true)),
  );

  // Created date with enhanced multi-line support
  const createdAt = formatCreatedDate(task.createdAt);
  const cleanCreatedAt = stripAnsi(createdAt);
  const createdLines = wrapText(cleanCreatedAt, textWidth);

  createdLines.forEach((line, index) => {
    if (index === 0) {
      // First line with label and colored created date
      const coloredLine =
        line === cleanCreatedAt
          ? createdAt +
            ` ${colors.meta(`(${new Date(task.createdAt).toLocaleDateString("ta-LK")})`)}`
          : colors.meta(line);
      console.log(
        createCardLine(
          `${colors.bold("Created:")} ${coloredLine}`,
          contentWidth,
          true,
        ),
      );
    } else {
      // Continuation lines with proper padding
      const padding = " ".repeat("Created:".length + 1);
      console.log(
        createCardLine(`${padding}${colors.meta(line)}`, contentWidth, true),
      );
    }
  });

  // Subtasks with multi-line support
  if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    console.log(createCardLine("", contentWidth));
    console.log(
      `${colors.title(`├─ ${colors.bold("Subtasks:")} ${colors.info(`(${task.subtasks.length} ${task.subtasks.length === 1 ? "item" : "items"})`)} ${"─".repeat(cardWidth - Number(task.subtasks.length === 1 ? 23 : 9 > task.subtasks.length ? 24 : 25))}┤`)}`,
    );
    // createCardLine(
    //   `${colors.bold("Subtasks:")} ${colors.info(`(${task.subtasks.length} ${task.subtasks.length === 1 ? "item" : "items"})`)}`,
    //   contentWidth,
    //   true,
    // ),
    // console.log(`${colors.title(`├${createBorder("─", cardWidth)}┤`)}`);

    task.subtasks.forEach((subtask) => {
      const subStatusIcon = getStatusIcon(subtask.status);
      const maxSubtitleLength = contentWidth - 8; // Account for "   [X] ○ "
      const subtaskLines = wrapText(subtask.title, maxSubtitleLength);

      subtaskLines.forEach((line, index) => {
        if (index === 0) {
          // First line with ID and status icon
          console.log(
            createCardLine(
              `  ${colors.meta(`[${subtask.id}]`)} ${subStatusIcon} ${colors.title(line)}`,
              contentWidth,
              true,
            ),
          );
        } else {
          // Continuation lines with proper indentation
          const indent = "      "; // Space for "  [X] ○ "
          console.log(
            createCardLine(
              `${indent}${colors.title(line)}`,
              contentWidth,
              true,
            ),
          );
        }
      });
    });
  }

  console.log(createCardLine("", contentWidth));
  console.log(`${colors.title(`└${createBorder("─", cardWidth)}┘`)}\n`);
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

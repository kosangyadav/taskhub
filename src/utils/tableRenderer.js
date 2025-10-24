/**
 * Table renderer utility for TaskHub
 * Handles all table rendering logic with reusable components
 */

import {
  colors,
  coloredStatus,
  coloredPriority,
  getStatusIcon,
  getPriorityIcon,
} from "./colors.js";
import {
  TABLE_CONFIG,
  DISPLAY_LIMITS,
  TEXT_CONFIG,
} from "../config/constants.js";

/**
 * Generates table borders dynamically based on column widths
 */
const generateTableBorder = (type = "top") => {
  const { columns } = TABLE_CONFIG;
  const chars = {
    top: { left: "┌", middle: "┬", right: "┐", line: "─" },
    middle: { left: "├", middle: "┼", right: "┤", line: "─" },
    bottom: { left: "└", middle: "┴", right: "┘", line: "─" },
  };

  const borderType = type === "separator" ? "middle" : type;
  const { left, middle, right, line } = chars[borderType];

  const sections = Object.values(columns).map((col) =>
    line.repeat(col.width + 2),
  );
  return left + sections.join(middle) + right;
};

const TABLE_HEADER =
  "│ ID │ PRIORITY │   DUE DATE  │                      TITLE                       │ SUB │ STATUS │      TAGS            │";

/**
 * Truncates text to fit within specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength
    ? text.slice(0, maxLength - 3) + TEXT_CONFIG.ellipsis
    : text;
};

/**
 * Formats tags for table display
 * @param {Array} tags - Array of tag strings
 * @param {number} maxLength - Maximum display length
 * @returns {string} - Formatted tags string
 */
const formatTagsForTable = (
  tags,
  maxLength = TABLE_CONFIG.columns.tags.width,
) => {
  if (!tags || tags.length === 0) return "";

  if (tags.length <= TEXT_CONFIG.maxTagsDisplay) {
    const joined = tags.join(",");
    return joined.length <= maxLength
      ? joined
      : tags[0] + TEXT_CONFIG.tagOverflowSuffix;
  }

  // For more than 2 tags, try to fit first two
  const firstTwo = tags.slice(0, TEXT_CONFIG.maxTagsDisplay).join(",");
  return firstTwo.length <= maxLength - 3
    ? firstTwo + TEXT_CONFIG.tagOverflowSuffix
    : tags[0] + TEXT_CONFIG.tagOverflowSuffix;
};

/**
 * Formats a single table row
 * @param {Object} task - Task object
 * @returns {string} - Formatted table row
 */
const formatTableRow = (task) => {
  const id = String(task.id).padEnd(TABLE_CONFIG.columns.id.width);

  const priorityIcon = getPriorityIcon(task.priority || "noise");
  const priority = (task.priority || "noise").slice(0, 6).padEnd(6);

  const title = truncateText(task.title, TABLE_CONFIG.columns.title.width);
  const paddedTitle = title.padEnd(TABLE_CONFIG.columns.title.width);

  const statusIcon = getStatusIcon(task.status);
  const status = task.status.slice(0, 5).padEnd(5);
  const statusPadding = task.status === "doing" ? "" : " ";

  const subtaskCount = task.subtasks ? task.subtasks.length : 0;
  const paddedSubtasks = String(subtaskCount).padEnd(
    TABLE_CONFIG.columns.subtasks.width,
  );

  const dueDateClean = (task.due || "No due date").padEnd(
    TABLE_CONFIG.columns.dueDate.width,
  );

  const tags = formatTagsForTable(task.tags);
  const paddedTags = tags.padEnd(TABLE_CONFIG.columns.tags.width);

  return `│ ${colors.meta(id)} │ ${priorityIcon} ${coloredPriority(priority)} │ ${colors.meta(dueDateClean)} │ ${colors.title(paddedTitle)} │ ${colors.info(paddedSubtasks)} │ ${statusIcon} ${coloredStatus(task.status)}${statusPadding}│ ${colors.tag(paddedTags)} │`;
};

/**
 * Renders table header with borders
 * @returns {Array<string>} - Array of header lines
 */
const renderTableHeader = () => {
  return [
    colors.title(generateTableBorder("top")),
    colors.title(TABLE_HEADER),
    colors.title(generateTableBorder("separator")),
  ];
};

/**
 * Renders table footer
 * @returns {string} - Table footer line
 */
const renderTableFooter = () => {
  return colors.title(generateTableBorder("bottom"));
};

/**
 * Renders separator between table rows
 * @returns {string} - Separator line
 */
const renderTableSeparator = () => {
  return colors.title(generateTableBorder("separator"));
};

/**
 * Renders complete table for tasks
 * @param {Array} tasks - Array of task objects
 * @returns {void} - Outputs directly to console
 */
export const renderTaskTable = (tasks) => {
  if (!tasks || tasks.length === 0) return;

  // Render header
  const headerLines = renderTableHeader();
  headerLines.forEach((line) => console.log(line));

  // Render rows
  tasks.forEach((task, index) => {
    console.log(formatTableRow(task));

    // Add separator between rows (except for last row)
    if (index < tasks.length - 1) {
      console.log(renderTableSeparator());
    }
  });

  // Render footer
  console.log(renderTableFooter());
};

/**
 * Renders filter summary header
 * @param {number} taskCount - Number of tasks found
 * @param {Object} options - Filter options
 * @returns {void} - Outputs directly to console
 */
export const renderFilterSummary = (taskCount, options = {}) => {
  const activeFilters = [];

  if (options.status) {
    activeFilters.push(`status: ${colors.warn(options.status)}`);
  }
  if (options.priority) {
    activeFilters.push(`priority: ${colors.info(options.priority)}`);
  }
  if (options.due) {
    activeFilters.push(`due: ${colors.meta(options.due)}`);
  }
  if (options.tags) {
    activeFilters.push(`tags: ${colors.tag(options.tags)}`);
  }
  if (options.find) {
    activeFilters.push(`search: ${colors.title(options.find)}`);
  }

  const filterText =
    activeFilters.length > 0
      ? ` with filters: ${activeFilters.join(", ")}`
      : "";

  const taskText = taskCount === 1 ? "task" : "tasks";

  console.log(
    `\n${colors.success("✔")} Found ${colors.bold(taskCount)} ${taskText}${filterText}\n`,
  );
};

/**
 * Renders task count summary footer
 * @param {Array} tasks - Array of task objects
 * @returns {void} - Outputs directly to console
 */
export const renderTaskSummary = (tasks) => {
  if (!tasks || tasks.length === 0) return;

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const summaryParts = [];
  if (statusCounts.todo) {
    summaryParts.push(`${colors.error(statusCounts.todo)} todo`);
  }
  if (statusCounts.doing) {
    summaryParts.push(`${colors.info(statusCounts.doing)} doing`);
  }
  if (statusCounts.done) {
    summaryParts.push(`${colors.meta(statusCounts.done)} done`);
  }

  console.log(`\n${colors.meta("Summary:")} ${summaryParts.join(" • ")}\n`);
};

/**
 * Renders "no tasks found" message
 * @returns {void} - Outputs directly to console
 */
export const renderNoTasksMessage = () => {
  console.log(`\n${colors.error("✘ No tasks found")}`);
  console.log(
    colors.meta("Try adjusting your filters or add some tasks first."),
  );
};

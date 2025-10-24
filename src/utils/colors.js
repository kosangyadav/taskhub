import chalk from "chalk";

export const colors = {
  success: chalk.hex("#08CB00"),
  error: chalk.hex("#FF0000").bold,
  warn: chalk.hex("#F39F5A").bold,
  info: chalk.hex("#FF6363").bold,
  meta: chalk.hex("#80A1BA"),
  tag: chalk.hex("#85CFCB"),
  title: chalk.hex("#8B5DFF").bold,
  bold: chalk.bold,
};

export const bgColors = {
  success: chalk.bgHex("#08CB00").black,
  error: chalk.bgHex("#FF0000").black.bold,
  warn: chalk.bgHex("#F39F5A").black.bold,
  info: chalk.bgHex("#FF6363").black.bold,
  meta: chalk.bgHex("#80A1BA").black,
  tag: chalk.bgHex("#85CFCB").black,
  title: chalk.bgHex("#8B5DFF").black.bold,
  bold: chalk.bold,
};

export const coloredStatus = (status) => {
  switch (status) {
    case "todo":
      return colors.error(status);
    case "doing":
      return colors.info(status);
    case "done":
      return colors.meta(status);
    default:
      return status;
  }
};

export const coloredPriority = (priority) => {
  switch (priority.trim()) {
    case "noise":
      return colors.meta(priority);
    case "high":
      return colors.info(priority);
    case "signal":
      return colors.error(priority);
    default:
      return colors.warn(priority);
  }
};

/**
 * Gets status icon for tasks and subtasks
 * @param {string} status - Status (todo, doing, done)
 * @returns {string} - Status icon
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case "todo":
      return `${colors.error("○")}`;
    case "doing":
      return `${colors.info("◐")}`;
    case "done":
      return `${colors.meta("●")}`;
    default:
      return `${colors.error("○")}`;
  }
};

/**
 * Gets priority icon for tasks
 * @param {string} priority - Priority (noise, high, signal)
 * @returns {string} - Priority icon
 */
export const getPriorityIcon = (priority) => {
  switch (priority) {
    case "noise":
      return `${colors.meta(0)}`;
    case "high":
      return `${colors.info(1)}`;
    case "signal":
      return `${colors.error("#")}`;
    default:
      return `${colors.info(1)}`;
  }
};

// Object.entries(colors).forEach(([key, fn]) =>
//   console.log(fn(`${key.toUpperCase()} color sample`)),
// );

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

export const coloredStatus = (status) => {
  switch (status) {
    case "todo":
      return colors.warn(status);
    case "doing":
      return colors.info(status);
    case "done":
      return colors.success(status);
    default:
      return status;
  }
};

export const coloredPriority = (priority) => {
  switch (priority) {
    case "low":
      return colors.tag(priority);
    case "medium":
      return colors.info(priority);
    case "high":
      return colors.warn(priority);
    case "top":
      return colors.error(chalk.underline(priority));
    case "signal":
      return colors.error(priority + "!!");
    default:
      return priority;
  }
};

// Object.entries(colors).forEach(([key, fn]) =>
//   console.log(fn(`${key.toUpperCase()} color sample`)),
// );

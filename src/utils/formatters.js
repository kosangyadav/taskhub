/**
 * Formatters utility for TaskHub
 * Handles all console output formatting to keep command files clean
 */

import { colors, coloredPriority, coloredStatus } from "./colors.js";

/**
 * Formats task creation success message
 * @param {Object} task - Task object with all properties
 * @param {Object} options - Command options used for creation
 * @returns {string} - Formatted success message
 */
export const formatTaskCreated = (task, options) => {
  return `
${colors.success("✔ Task added successfully!")}
${colors.bold("Title:".padEnd(14))} ${colors.title(task.title)}
${colors.bold("Description:".padEnd(14))} ${colors.info(task.description || "No description")}
${colors.bold("Priority:".padEnd(14))} ${colors.error(coloredPriority(options.priority) || "high")}
${colors.bold("Status:".padEnd(14))} ${colors.warn(coloredStatus(options.status) || "todo")}
${colors.bold("Due Date:".padEnd(14))} ${colors.error(options.due || "No due date")}
${colors.bold("Tags:".padEnd(14))} ${
    task.tags && task.tags.length
      ? task.tags.map((tag) => colors.tag(tag.trim())).join(", ")
      : colors.meta("No tags")
  }
${colors.bold("Created at:".padEnd(14))} ${colors.meta(new Date().toLocaleString("ta-LK"))}
`;
};

/**
 * Formats subtask creation success message
 * @param {Object} parentTask - Parent task object
 * @param {string} parentID - Parent task ID
 * @param {string} title - Subtask title
 * @param {Object} options - Command options
 * @returns {string} - Formatted success message
 */
export const formatSubtaskCreated = (parentTask, parentID, title, options) => {
  return `${colors.success("✔ Subtask added successfully!")}
${colors.bold("Parent Task: ".padEnd(18))} ${colors.meta("[" + parentID + "]")} ${colors.title(parentTask.title)}
${colors.bold("Subtask Title:".padEnd(18))} ${colors.info(title)}
${colors.bold("Subtask Status:".padEnd(18))} ${colors.warn(coloredStatus(options.status)) || "todo"}
${colors.bold("Created at:".padEnd(18))} ${colors.meta(new Date().toLocaleString("ta-LK"))}
`;
};

/**
 * Formats task update success message
 * @param {string|number} taskID - Task ID that was updated
 * @returns {string} - Formatted success message
 */
export const formatTaskUpdated = (taskID) => {
  return colors.success(`✔ Task ID ${taskID} updated successfully...`);
};

/**
 * Formats subtask update success message
 * @param {string|number} subtaskID - Subtask ID
 * @param {string|number} parentID - Parent task ID
 * @returns {string} - Formatted success message
 */
export const formatSubtaskUpdated = (subtaskID, parentID) => {
  return colors.success(`✔ Updated subtask #${subtaskID} under task #${parentID}.`);
};

/**
 * Formats task removal success message
 * @param {Object} removedTask - The removed task object
 * @returns {string} - Formatted success message
 */
export const formatTaskRemoved = (removedTask) => {
  return colors.success(
    `✔ Removed task "${removedTask.title}" (ID: ${removedTask.id}).\n`,
  );
};

/**
 * Formats subtask removal success message
 * @param {Object} removedSubtask - The removed subtask object
 * @param {string|number} parentID - Parent task ID
 * @returns {string} - Formatted success message
 */
export const formatSubtaskRemoved = (removedSubtask, parentID) => {
  return colors.success(
    `✔ Removed subtask "${removedSubtask.title}" (ID: ${removedSubtask.id}) from task ${parentID}.\n`,
  );
};

/**
 * Formats error messages consistently
 * @param {string} message - Error message
 * @returns {string} - Formatted error message
 */
export const formatError = (message) => {
  return colors.error(`✘ ${message}`);
};

/**
 * Formats warning messages consistently
 * @param {string} message - Warning message
 * @returns {string} - Formatted warning message
 */
export const formatWarning = (message) => {
  return colors.warn(`⚠ ${message}`);
};

/**
 * Formats info messages consistently
 * @param {string} message - Info message
 * @returns {string} - Formatted info message
 */
export const formatInfo = (message) => {
  return colors.info(`ℹ️ ${message}`);
};

/**
 * Formats success messages consistently
 * @param {string} message - Success message
 * @returns {string} - Formatted success message
 */
export const formatSuccess = (message) => {
  return colors.success(`✔ ${message}`);
};

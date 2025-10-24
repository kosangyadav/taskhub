/**
 * Validation utilities for TaskHub
 * Consolidates all validation logic in one place to avoid circular dependencies
 */

import { colors, bgColors } from "./colors.js";

/**
 * Validates task status
 * @param {string} status - Status to validate
 * @returns {boolean} - True if valid, false otherwise
 */
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
  }
  return true;
};

/**
 * Validates task priority
 * @param {string} priority - Priority to validate
 * @returns {boolean} - True if valid, false otherwise
 */
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
  }
  return true;
};

/**
 * Validates task ID
 * @param {string|number} ID - ID to validate
 * @param {Array} tasks - Array of tasks to check against
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateID = (ID, tasks) => {
  if (isNaN(ID) || ID < 0 || ID >= tasks.length) {
    console.log(
      ` ${colors.error(`✘ Oops! There's no task with ID ${ID}. Try ${bgColors.info("'list'")} command to see all available tasks.`)}\n`,
    );
    return false;
  } else if (!Number.isInteger(Number(ID))) {
    console.log(
      ` ${colors.error(`✘ Oops! This ID: ${ID} is not valid for tasks, but valid for subtasks...\nIf you wants to remove a subtask, them add ${bgColors.info("'--sub'")} at the end of command.`)}\n`,
    );
    return false;
  }
  return true;
};

/**
 * Validates due date format (DD-MM-YYYY)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateDueDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    console.error(
      colors.error("✘ Due date cannot be empty. Use format: DD-MM-YYYY"),
    );
    return false;
  }

  // Check format DD-MM-YYYY
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(dateStr)) {
    console.error(
      colors.error(
        `✘ Invalid date format: ${dateStr}. Please use DD-MM-YYYY format (e.g., 25-12-2024)`,
      ),
    );
    return false;
  }

  // Parse and validate the date
  const parts = dateStr.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Basic range validation
  if (day < 1 || day > 31) {
    console.error(
      colors.error(`✘ Invalid day: ${day}. Day must be between 1 and 31`),
    );
    return false;
  }

  if (month < 1 || month > 12) {
    console.error(
      colors.error(`✘ Invalid month: ${month}. Month must be between 1 and 12`),
    );
    return false;
  }

  if (year < 1900 || year > 2100) {
    console.error(
      colors.error(
        `✘ Invalid year: ${year}. Year must be between 1900 and 2100`,
      ),
    );
    return false;
  }

  // Check if the date is actually valid (handles cases like 31-02-2024)
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    console.error(
      colors.error(
        `✘ Invalid date: ${dateStr}. This date does not exist in the calendar`,
      ),
    );
    return false;
  }

  return true;
};

/**
 * Validates subtask options to prevent unsupported parameters
 * @param {Object} options - Command options
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateSubtaskOptions = (options) => {
  if (options.priority) {
    console.error(
      colors.error(
        "✘ Subtasks don't support priority. Only title and status are allowed for subtasks.",
      ),
    );
    return false;
  }

  if (options.due) {
    console.error(
      colors.error(
        "✘ Subtasks don't support due dates. Only title and status are allowed for subtasks.",
      ),
    );
    return false;
  }

  if (options.description) {
    console.error(
      colors.error(
        "✘ Subtasks don't support descriptions. Only title and status are allowed for subtasks.",
      ),
    );
    return false;
  }

  if (options.tags) {
    console.error(
      colors.error(
        "✘ Subtasks don't support tags. Only title and status are allowed for subtasks.",
      ),
    );
    return false;
  }

  return true;
};

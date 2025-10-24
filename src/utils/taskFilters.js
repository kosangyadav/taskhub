/**
 * Task filters utility for TaskHub
 * Provides reusable filtering functions for task operations
 */

import { validateStatus, validatePriority } from "./validation.js";

/**
 * Filters tasks by status
 * @param {Array} tasks - Array of task objects
 * @param {string} status - Status to filter by (todo, doing, done)
 * @returns {Array|null} - Filtered tasks array or null if invalid status
 */
export const filterByStatus = (tasks, status) => {
  if (!validateStatus(status)) return null;
  return tasks.filter((task) => task.status === status);
};

/**
 * Filters tasks by priority
 * @param {Array} tasks - Array of task objects
 * @param {string} priority - Priority to filter by (noise, high, signal)
 * @returns {Array|null} - Filtered tasks array or null if invalid priority
 */
export const filterByPriority = (tasks, priority) => {
  if (!validatePriority(priority)) return null;
  return tasks.filter((task) => task.priority === priority);
};

/**
 * Filters tasks by due date
 * @param {Array} tasks - Array of task objects
 * @param {string} dueDate - Due date to filter by (DD-MM-YYYY format)
 * @returns {Array} - Filtered tasks array
 */
export const filterByDueDate = (tasks, dueDate) => {
  return tasks.filter((task) => task.due && task.due === dueDate);
};

/**
 * Filters tasks by tags (all specified tags must be present)
 * @param {Array} tasks - Array of task objects
 * @param {string} tagsString - Comma-separated tags string
 * @returns {Array} - Filtered tasks array
 */
export const filterByTags = (tasks, tagsString) => {
  const tags = tagsString.split(",").map((tag) => tag.trim().toLowerCase());
  return tasks.filter(
    (task) =>
      task.tags &&
      tags.every((tag) => task.tags.map((t) => t.toLowerCase()).includes(tag)),
  );
};

/**
 * Filters tasks by search keywords (searches title and description)
 * @param {Array} tasks - Array of task objects
 * @param {string} keywords - Keywords to search for
 * @returns {Array} - Filtered tasks array
 */
export const filterByKeywords = (tasks, keywords) => {
  const searchTerm = keywords.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm)),
  );
};

/**
 * Filters tasks by multiple criteria
 * @param {Array} tasks - Array of task objects
 * @param {Object} options - Filter options object
 * @param {string} [options.status] - Status filter
 * @param {string} [options.priority] - Priority filter
 * @param {string} [options.due] - Due date filter
 * @param {string} [options.tags] - Tags filter (comma-separated)
 * @param {string} [options.find] - Keywords filter
 * @returns {Array|null} - Filtered tasks array or null if validation fails
 */
export const filterTasks = (tasks, options = {}) => {
  let filteredTasks = [...tasks];

  // Apply status filter
  if (options.status) {
    const statusFiltered = filterByStatus(filteredTasks, options.status);
    if (statusFiltered === null) return null; // Validation failed
    filteredTasks = statusFiltered;
  }

  // Apply priority filter
  if (options.priority) {
    const priorityFiltered = filterByPriority(filteredTasks, options.priority);
    if (priorityFiltered === null) return null; // Validation failed
    filteredTasks = priorityFiltered;
  }

  // Apply due date filter
  if (options.due) {
    filteredTasks = filterByDueDate(filteredTasks, options.due);
  }

  // Apply tags filter
  if (options.tags) {
    filteredTasks = filterByTags(filteredTasks, options.tags);
  }

  // Apply keywords filter
  if (options.find) {
    filteredTasks = filterByKeywords(filteredTasks, options.find);
  }

  return filteredTasks;
};

/**
 * Checks if any filters are active
 * @param {Object} options - Filter options object
 * @returns {boolean} - True if any filters are active
 */
export const hasActiveFilters = (options = {}) => {
  return !!(
    options.status ||
    options.priority ||
    options.due ||
    options.tags ||
    options.find
  );
};

/**
 * Gets a summary of active filters for display
 * @param {Object} options - Filter options object
 * @returns {Array} - Array of filter description strings
 */
export const getActiveFiltersDescription = (options = {}) => {
  const filters = [];

  if (options.status) filters.push(`status: ${options.status}`);
  if (options.priority) filters.push(`priority: ${options.priority}`);
  if (options.due) filters.push(`due: ${options.due}`);
  if (options.tags) filters.push(`tags: ${options.tags}`);
  if (options.find) filters.push(`search: ${options.find}`);

  return filters;
};

/**
 * Counts tasks by status
 * @param {Array} tasks - Array of task objects
 * @returns {Object} - Object with status counts
 */
export const getStatusCounts = (tasks) => {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
};

/**
 * Counts tasks by priority
 * @param {Array} tasks - Array of task objects
 * @returns {Object} - Object with priority counts
 */
export const getPriorityCounts = (tasks) => {
  return tasks.reduce((acc, task) => {
    const priority = task.priority || "high";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
};

/**
 * Gets tasks with due dates in the past (overdue)
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Array of overdue tasks
 */
export const getOverdueTasks = (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (!task.due) return false;

    const [day, month, year] = task.due.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  });
};

/**
 * Gets tasks due within a specified number of days
 * @param {Array} tasks - Array of task objects
 * @param {number} days - Number of days from today
 * @returns {Array} - Array of tasks due within the specified days
 */
export const getTasksDueWithin = (tasks, days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + days);

  return tasks.filter((task) => {
    if (!task.due) return false;

    const [day, month, year] = task.due.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate >= today && dueDate <= targetDate;
  });
};

/**
 * Sorts tasks by priority (signal > high > noise)
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Sorted array of tasks
 */
export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { signal: 3, high: 2, noise: 1 };

  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority || "high"];
    const bPriority = priorityOrder[b.priority || "high"];
    return bPriority - aPriority;
  });
};

/**
 * Sorts tasks by due date (earliest first)
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Sorted array of tasks
 */
export const sortTasksByDueDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    // Tasks without due dates go to the end
    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;

    // Parse dates and compare
    const [dayA, monthA, yearA] = a.due.split("-").map(Number);
    const [dayB, monthB, yearB] = b.due.split("-").map(Number);

    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);

    return dateA - dateB;
  });
};

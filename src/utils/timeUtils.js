/**
 * Time utilities for TaskHub with color-coded time remaining functionality
 * Handles date formatting, relative time calculation, and color coding based on urgency
 */

import { colors } from "./colors.js";

/**
 * Color codes for time urgency levels
 */
const timeColors = {
  overdue: colors.error, // Red - past due
  critical: colors.error, // Red - within 24 hours
  urgent: colors.warn, // Orange - within 3 days
  moderate: colors.info, // Pink - within 1 week
  normal: colors.meta, // Blue - more than 1 week
  none: colors.meta, // Blue - no due date
};

/**
 * Parses a date string in DD-MM-YYYY format
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map((num) => parseInt(num, 10));

  // Basic validation
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900)
    return null;

  // Create date (month is 0-indexed in JavaScript)
  const date = new Date(year, month - 1, day);

  // Verify the date is valid and matches input (catches invalid dates like 31-02-2024)
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }

  return date;
};

/**
 * Gets the time difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date (default: now)
 * @returns {number} - Difference in days (positive if date1 is in future)
 */
const getDaysDifference = (date1, date2 = new Date()) => {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

  // Set both dates to start of day for accurate day comparison
  const startOfDate1 = new Date(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate(),
  );
  const startOfDate2 = new Date(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate(),
  );

  return Math.round((startOfDate1 - startOfDate2) / oneDay);
};

/**
 * Determines the urgency level based on days remaining
 * @param {number} daysRemaining - Number of days until due date
 * @returns {string} - Urgency level key
 */
const getUrgencyLevel = (daysRemaining) => {
  if (daysRemaining < 0) return "overdue";
  if (daysRemaining <= 1) return "critical";
  if (daysRemaining <= 3) return "urgent";
  if (daysRemaining <= 7) return "moderate";
  return "normal";
};

/**
 * Formats relative time with appropriate color coding
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {string} - Colored relative time string
 */
export const formatRelativeTime = (dueDateStr) => {
  if (!dueDateStr) {
    return timeColors.none("No due date");
  }

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) {
    return timeColors.none("Invalid date");
  }

  const daysRemaining = getDaysDifference(dueDate);
  const urgencyLevel = getUrgencyLevel(daysRemaining);
  const colorFn = timeColors[urgencyLevel];

  // Format the message based on days remaining
  let message;
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    if (daysOverdue === 1) {
      message = "1 day overdue";
    } else {
      message = `${daysOverdue} days overdue`;
    }
  } else if (daysRemaining === 0) {
    message = "Due today";
  } else if (daysRemaining === 1) {
    message = "Due tomorrow";
  } else if (daysRemaining <= 7) {
    message = `Due in ${daysRemaining} days`;
  } else if (daysRemaining <= 30) {
    const weeks = Math.floor(daysRemaining / 7);
    const remainingDays = daysRemaining % 7;
    if (weeks === 1 && remainingDays === 0) {
      message = "Due in 1 week";
    } else if (remainingDays === 0) {
      message = `Due in ${weeks} weeks`;
    } else {
      message = `Due in ${weeks}w ${remainingDays}d`;
    }
  } else {
    const months = Math.floor(daysRemaining / 30);
    const remainingDays = daysRemaining % 30;
    if (months === 1 && remainingDays <= 7) {
      message = "Due in 1 month";
    } else {
      message = `Due in ${months}+ months`;
    }
  }

  return colorFn(message);
};

/**
 * Formats a creation date with appropriate styling
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted creation date
 */
export const formatCreatedDate = (dateStr) => {
  if (!dateStr) {
    return colors.meta("Unknown");
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return colors.meta("Invalid date");
    }

    const now = new Date();
    const diffInDays = getDaysDifference(now, date);

    // Format based on how long ago it was created
    if (diffInDays === 0) {
      return colors.success("Created today");
    } else if (diffInDays === 1) {
      return colors.info("Created yesterday");
    } else if (diffInDays <= 7) {
      return colors.meta(`Created ${diffInDays} days ago`);
    } else if (diffInDays <= 30) {
      const weeks = Math.floor(diffInDays / 7);
      return colors.meta(`Created ${weeks} week${weeks > 1 ? "s" : ""} ago`);
    } else {
      // For older dates, show the actual date
      return colors.meta(`Created on ${date.toLocaleDateString()}`);
    }
  } catch (error) {
    return colors.meta("Invalid date");
  }
};

/**
 * Gets just the color function for a due date (useful for other UI elements)
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {Function} - Color function to apply to text
 */
export const getDueDateColor = (dueDateStr) => {
  if (!dueDateStr) {
    return timeColors.none;
  }

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) {
    return timeColors.none;
  }

  const daysRemaining = getDaysDifference(dueDate);
  const urgencyLevel = getUrgencyLevel(daysRemaining);
  return timeColors[urgencyLevel];
};

/**
 * Checks if a task is overdue
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {boolean} - True if task is overdue
 */
export const isOverdue = (dueDateStr) => {
  if (!dueDateStr) return false;

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) return false;

  return getDaysDifference(dueDate) < 0;
};

/**
 * Checks if a task is due soon (within specified days)
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @param {number} days - Number of days to consider as "soon" (default: 3)
 * @returns {boolean} - True if task is due within the specified days
 */
export const isDueSoon = (dueDateStr, days = 3) => {
  if (!dueDateStr) return false;

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) return false;

  const daysRemaining = getDaysDifference(dueDate);
  return daysRemaining >= 0 && daysRemaining <= days;
};

/**
 * Gets a summary of task urgency for a list of tasks
 * @param {Array} tasks - Array of task objects with 'due' property
 * @returns {Object} - Summary object with counts for each urgency level
 */
export const getTaskUrgencySummary = (tasks) => {
  const summary = {
    overdue: 0,
    critical: 0,
    urgent: 0,
    moderate: 0,
    normal: 0,
    none: 0,
  };

  tasks.forEach((task) => {
    if (!task.due) {
      summary.none++;
      return;
    }

    const dueDate = parseDate(task.due);
    if (!dueDate) {
      summary.none++;
      return;
    }

    const daysRemaining = getDaysDifference(dueDate);
    const urgencyLevel = getUrgencyLevel(daysRemaining);
    summary[urgencyLevel]++;
  });

  return summary;
};

/**
 * Formats a complete due date with both absolute and relative information
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {string} - Formatted due date with color coding
 */
export const formatCompleteDueDate = (dueDateStr) => {
  if (!dueDateStr) {
    return timeColors.none("No due date set");
  }

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) {
    return timeColors.none(`Invalid date: ${dueDateStr}`);
  }

  const relativeTime = formatRelativeTime(dueDateStr);
  const formattedDate = dueDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const daysRemaining = getDaysDifference(dueDate);
  const urgencyLevel = getUrgencyLevel(daysRemaining);
  const colorFn = timeColors[urgencyLevel];

  return `${relativeTime} ${colorFn(`(${formattedDate})`)}`;
};

/**
 * Gets urgency message for display in task details
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {string|null} - Colored urgency message or null if no message needed
 */
export const getUrgencyMessage = (dueDateStr) => {
  if (!dueDateStr) return null;

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) return null;

  const daysRemaining = getDaysDifference(dueDate);

  if (daysRemaining < 0) {
    return timeColors.overdue("⚠ Task is overdue!");
  } else if (daysRemaining <= 1) {
    return timeColors.critical("⏰ Due very soon!");
  } else if (daysRemaining <= 3) {
    return timeColors.urgent("📅 Due within 3 days");
  } else if (daysRemaining <= 7) {
    return timeColors.moderate("📋 Due this week");
  }

  return null; // No urgency message for tasks due later
};

/**
 * Gets header urgency indicator for task display
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {string} - Colored header indicator or empty string
 */
export const getHeaderUrgencyIndicator = (dueDateStr) => {
  if (!dueDateStr) return "";

  const dueDate = parseDate(dueDateStr);
  if (!dueDate) return "";

  const daysRemaining = getDaysDifference(dueDate);

  if (daysRemaining < 0) {
    return ` ${timeColors.overdue("⚠ OVERDUE")}`;
  } else if (daysRemaining <= 1) {
    return ` ${timeColors.critical("⏰ DUE SOON")}`;
  } else if (daysRemaining <= 3) {
    return ` ${timeColors.urgent("📅 URGENT")}`;
  }

  return ""; // No header indicator for tasks due later
};

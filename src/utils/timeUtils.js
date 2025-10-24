/**
 * Minimal time utilities for TaskHub
 * Only essential functions used across the codebase
 */

import { colors } from "./colors.js";
import { ICONS, TIME_CONSTANTS } from "../config/constants.js";

// Color mapping for urgency levels
const urgencyColors = {
  overdue: colors.error,
  critical: colors.error,
  urgent: colors.warn,
  moderate: colors.info,
  normal: colors.meta,
  none: colors.meta,
};

/**
 * Parses DD-MM-YYYY date string to Date object
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 ? date : null;
};

/**
 * Gets days difference between dates
 */
export const getDaysDifference = (date1, date2 = new Date()) => {
  const ms =
    new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) -
    new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round(ms / TIME_CONSTANTS.millisecondsPerDay);
};

/**
 * Gets urgency level based on days remaining
 */
const getUrgencyLevel = (days) => {
  if (days < 0) return "overdue";
  if (days <= TIME_CONSTANTS.urgencyThresholds.critical) return "critical";
  if (days <= TIME_CONSTANTS.urgencyThresholds.urgent) return "urgent";
  if (days <= TIME_CONSTANTS.urgencyThresholds.moderate) return "moderate";
  return "normal";
};

/**
 * Formats relative time with color coding
 */
export const formatRelativeTime = (dueDateStr) => {
  if (!dueDateStr) return urgencyColors.none("No due date");

  const date = parseDate(dueDateStr);
  if (!date) return urgencyColors.none("Invalid date");

  const days = getDaysDifference(date);
  const urgency = getUrgencyLevel(days);

  let message;
  if (days < 0)
    message = `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  else if (days === 0) message = "Due today";
  else if (days === 1) message = "Due tomorrow";
  else if (days <= 7) message = `Due in ${days} days`;
  else if (days <= 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    message = remainingDays
      ? `Due in ${weeks}w ${remainingDays}d`
      : `Due in ${weeks} week${weeks > 1 ? "s" : ""}`;
  } else {
    const months = Math.floor(days / 30);
    message = `Due in ${months}+ month${months > 1 ? "s" : ""}`;
  }

  return urgencyColors[urgency](message);
};

/**
 * Formats creation date with color coding
 */
export const formatCreatedDate = (dateStr) => {
  if (!dateStr) return colors.meta("Unknown");

  const date = new Date(dateStr);
  if (isNaN(date)) return colors.meta("Invalid date");

  const days = getDaysDifference(new Date(), date);

  if (days === 0) return colors.success("Created today");
  if (days === 1) return colors.info("Created yesterday");
  if (days <= 7) return colors.meta(`Created ${days} days ago`);

  return colors.meta(`Created on ${date.toLocaleDateString()}`);
};

/**
 * Gets color function for due date
 */
export const getDueDateColor = (dueDateStr) => {
  if (!dueDateStr) return urgencyColors.none;

  const date = parseDate(dueDateStr);
  if (!date) return urgencyColors.none;

  const urgency = getUrgencyLevel(getDaysDifference(date));
  return urgencyColors[urgency];
};

/**
 * Formats complete due date with absolute and relative info
 */
export const formatCompleteDueDate = (dueDateStr) => {
  if (!dueDateStr) return urgencyColors.none("No due date set");

  const date = parseDate(dueDateStr);
  if (!date) return urgencyColors.none(`Invalid date: ${dueDateStr}`);

  const relativeTime = formatRelativeTime(dueDateStr);
  const absoluteDate = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const urgency = getUrgencyLevel(getDaysDifference(date));

  return `${relativeTime} ${urgencyColors[urgency](`(${absoluteDate})`)}`;
};

/**
 * Gets urgency message for task display
 */
export const getUrgencyMessage = (dueDateStr) => {
  if (!dueDateStr) return null;

  const date = parseDate(dueDateStr);
  if (!date) return null;

  const days = getDaysDifference(date);
  let message = null;

  if (days < 0) message = "Task is overdue!";
  else if (days <= TIME_CONSTANTS.urgencyThresholds.critical)
    message = "Due very soon!";
  else if (days <= TIME_CONSTANTS.urgencyThresholds.urgent)
    message = "Due within 3 days";
  else if (days <= TIME_CONSTANTS.urgencyThresholds.moderate)
    message = "Due this week";

  if (!message) return null;

  const urgency = getUrgencyLevel(days);
  const iconMap = {
    overdue: ICONS.urgency.overdue,
    critical: ICONS.urgency.critical,
    urgent: ICONS.urgency.urgent,
    moderate: ICONS.urgency.moderate,
  };

  const icon = iconMap[urgency] || "";
  return urgencyColors[urgency](`${icon} ${message}`);
};

/**
 * Gets header urgency indicator
 */
export const getHeaderUrgencyIndicator = (dueDateStr) => {
  if (!dueDateStr) return "";

  const date = parseDate(dueDateStr);
  if (!date) return "";

  const days = getDaysDifference(date);
  let text = "";

  if (days < 0) text = "OVERDUE";
  else if (days <= TIME_CONSTANTS.urgencyThresholds.critical) text = "DUE SOON";
  else if (days <= TIME_CONSTANTS.urgencyThresholds.urgent) text = "URGENT";

  if (!text) return "";

  const urgency = getUrgencyLevel(days);
  const iconMap = {
    overdue: ICONS.urgency.overdue,
    critical: ICONS.urgency.critical,
    urgent: ICONS.urgency.urgent,
  };

  const icon = iconMap[urgency] || "";
  return ` ${urgencyColors[urgency](`${icon} ${text}`)}`;
};

/**
 * Constants configuration for TaskHub
 * Centralizes all magic numbers, default values, and configuration options
 */

// Task defaults
export const TASK_DEFAULTS = {
  status: "todo",
  priority: "high",
  description: "",
  tags: [],
  subtasks: [],
};

// Valid enum values
export const VALID_VALUES = {
  statuses: ["todo", "doing", "done"],
  priorities: ["noise", "high", "signal"],
};

// Display limits and formatting
export const DISPLAY_LIMITS = {
  // Compact list truncation
  compactTitleLength: 50,
  compactTitleTruncate: 47,

  // Table formatting
  tableTitleLength: 48,
  tableTitleTruncate: 45,
  tableTagsLength: 20,

  // Card display
  cardMinWidth: 30,
  cardMaxWidth: 88,
  cardContentPadding: 4,
  cardMaxLabelWidth: 12,

  // Subtask display
  subtaskIndentLength: 8, // "   [X] ○ "
  subtaskContinuationIndent: 6, // "      "
};

// Table configuration
export const TABLE_CONFIG = {
  columns: {
    id: { width: 2 },
    priority: { width: 8 },
    dueDate: { width: 11 },
    title: { width: 48 },
    subtasks: { width: 3 },
    status: { width: 6 },
    tags: { width: 20 },
  },
};

// Date and time constants
export const TIME_CONSTANTS = {
  millisecondsPerDay: 24 * 60 * 60 * 1000,
  daysPerWeek: 7,
  daysPerMonth: 30,
  urgencyThresholds: {
    critical: 1, // 1 day or less
    urgent: 3, // 3 days or less
    moderate: 7, // 1 week or less
  },
  dateFormat: {
    regex: /^\d{2}-\d{2}-\d{4}$/,
    example: "DD-MM-YYYY",
    separator: "-",
  },
  yearRange: {
    min: 1900,
    max: 2100,
  },
};

// File and storage constants
export const STORAGE_CONFIG = {
  configDir: ".config",
  appDir: "taskhub",
  fileName: "tasks.json",
  encoding: "utf8",
  jsonIndent: 2,
};

// Priority and status icons
export const ICONS = {
  status: {
    todo: "○",
    doing: "◐",
    done: "●",
    default: "○",
  },
  priority: {
    noise: "0",
    high: "1",
    signal: "#",
    default: "1",
  },
  urgency: {
    overdue: "⚠",
    critical: "⏰",
    urgent: "📅",
    moderate: "📋",
  },
};

// Text truncation and display
export const TEXT_CONFIG = {
  ellipsis: "...",
  maxTagsDisplay: 2,
  tagPrefix: "#",
  tagSeparator: ", ",
  tagOverflowSuffix: "...",

  // Multi-line text wrapping
  defaultIndent: "  ",
  continuationPadding: " ".repeat(8),

  // Compact list formatting
  compactSeparator: " • ",
  compactIdPadding: 2,
};

// User interaction constants
export const UI_CONSTANTS = {
  confirmPrompts: {
    yes: ["y", "yes", "yeah", "yep", "sure", "ok", "okay"],
    no: ["n", "no", "nope", "cancel", "abort"],
  },
  defaultAnswers: {
    dangerous: false,
    normal: false,
  },
};

// Validation constants
export const VALIDATION_CONFIG = {
  dateFormat: "DD-MM-YYYY",
  maxTitleLength: 200,
  maxDescriptionLength: 1000,
  maxTagLength: 50,
  maxTagsCount: 20,

  // Error messages
  messages: {
    invalidStatus: "invalid status. Please use one of the following:",
    invalidPriority: "invalid priority. Please use one of the following:",
    invalidDate: "Invalid date format. Please use DD-MM-YYYY format",
    invalidId: "There's no task with ID",
    subtaskNotSupported: "Subtasks don't support",
  },
};

// Performance constants
export const PERFORMANCE_CONFIG = {
  maxTasksBeforePagination: 100,
  maxSearchResults: 50,
  cacheTimeout: 5000, // 5 seconds
};

// Locale and formatting
export const LOCALE_CONFIG = {
  default: "ta-LK", // Tamil - Sri Lanka
  dateFormat: {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  },
};

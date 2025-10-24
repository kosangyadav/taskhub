/**
 * Task display utilities for TaskHub
 * Handles card-style rendering and complex display logic extracted from listTask()
 */

import {
  colors,
  coloredStatus,
  coloredPriority,
  getStatusIcon,
  getPriorityIcon,
} from "./colors.js";
import {
  stripAnsi,
  getDisplayLength,
  wrapText,
  createCardLine,
  createMultiLineContent,
  createBorder,
} from "./textUtils.js";
import {
  formatCreatedDate,
  formatCompleteDueDate,
  getDueDateColor,
  getUrgencyMessage,
  getHeaderUrgencyIndicator,
} from "./timeUtils.js";

/**
 * Calculates optimal card width based on content
 * @param {Object} task - Task object
 * @returns {number} - Optimal card width
 */
const calculateCardWidth = (task) => {
  const contentLines = [
    `ID: ${task.id}`,
    `Title: ${task.title}`,
    task.description ? `Description: ${task.description}` : null,
    `Status: ${getStatusIcon(task.status)} ${task.status}`,
    `Priority: ${getPriorityIcon(task.priority || "high")} ${task.priority || "high"}`,
    `Due Date: ${stripAnsi(formatCompleteDueDate(task.due))}`,
    `Tags: ${task.tags && task.tags.length > 0 ? task.tags.map((tag) => `#${tag}`).join(" ") : "No tags"}`,
    `Created: ${formatCreatedDate(task.createdAt)} (${new Date(task.createdAt).toLocaleDateString()})`,
  ].filter(Boolean);

  const maxContentLength = Math.max(
    ...contentLines.map((line) => getDisplayLength(line)),
    30, // minimum width
  );
  return Math.min(maxContentLength + 4, 88);
};

/**
 * Renders task header with urgency indicator
 * @param {Object} task - Task object
 * @param {number} cardWidth - Card width
 * @returns {string} - Formatted header
 */
const renderTaskHeader = (task, cardWidth) => {
  const headerSuffix = getHeaderUrgencyIndicator(task.due);
  return `\n${colors.title(`┌─ Task Details ${createBorder("─", cardWidth - 15)}┐`)}${headerSuffix}`;
};

/**
 * Renders task ID section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskId = (task, contentWidth) => {
  return [
    createCardLine("", contentWidth),
    createCardLine(
      `${colors.bold("ID:")} ${colors.meta(task.id)}`,
      contentWidth,
      true,
    ),
  ];
};

/**
 * Renders task title section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @param {number} textWidth - Text width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskTitle = (task, contentWidth, textWidth) => {
  const titleLines = createMultiLineContent(
    "Title",
    task.title,
    textWidth,
    colors.title,
  );
  const result = [];
  titleLines.forEach((line) =>
    result.push(createCardLine(line, contentWidth, true)),
  );
  result.push(createCardLine("", contentWidth));
  return result;
};

/**
 * Renders task description section if present
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @param {number} textWidth - Text width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskDescription = (task, contentWidth, textWidth) => {
  if (!task.description) return [];

  const descriptionLines = createMultiLineContent(
    "Description",
    task.description,
    textWidth,
    colors.info,
  );
  const result = [];
  descriptionLines.forEach((line) =>
    result.push(createCardLine(line, contentWidth, true)),
  );
  result.push(createCardLine("", contentWidth));
  return result;
};

/**
 * Renders task status section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskStatus = (task, contentWidth) => {
  const statusIcon = getStatusIcon(task.status);

  return [
    createCardLine(
      `${colors.bold("Status:")} ${statusIcon} ${coloredStatus(task.status)}`,
      contentWidth,
      true,
    ),
  ];
};

/**
 * Renders task priority section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskPriority = (task, contentWidth) => {
  const priorityIcon = getPriorityIcon(task.priority || "high");

  return [
    createCardLine(
      `${colors.bold("Priority:")} ${priorityIcon} ${coloredPriority(task.priority || "high")}`,
      contentWidth,
      true,
    ),
  ];
};

/**
 * Renders task due date section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @param {number} textWidth - Text width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskDueDate = (task, contentWidth, textWidth) => {
  const result = [];

  if (task.due) {
    const completeDueDate = formatCompleteDueDate(task.due);
    const cleanCompleteDueDate = stripAnsi(completeDueDate);

    if (getDisplayLength(`Due Date: ${cleanCompleteDueDate}`) <= contentWidth) {
      // Single line display
      result.push(
        createCardLine(
          `${colors.bold("Due Date:")} ${completeDueDate}`,
          contentWidth,
          true,
        ),
      );
    } else {
      // Multi-line fallback
      const dueDateColor = getDueDateColor(task.due);
      const dueDateLines = wrapText(cleanCompleteDueDate, textWidth);
      dueDateLines.forEach((line, index) => {
        if (index === 0) {
          const coloredLine =
            line === cleanCompleteDueDate
              ? completeDueDate
              : dueDateColor(line);
          result.push(
            createCardLine(
              `${colors.bold("Due Date:")} ${coloredLine}`,
              contentWidth,
              true,
            ),
          );
        } else {
          const padding = " ".repeat("Due Date:".length + 1);
          result.push(
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
        result.push(
          createCardLine(
            `${colors.bold("Urgency:")} ${urgencyMessage}`,
            cleanUrgencyMessage === "⏰ Due very soon!"
              ? contentWidth - 1
              : contentWidth,
            true,
          ),
        );
      } else {
        // Multi-line urgency message
        const urgencyLines = wrapText(cleanUrgencyMessage, textWidth);
        urgencyLines.forEach((line, index) => {
          if (index === 0) {
            result.push(
              createCardLine(
                `${colors.bold("Urgency:")} ${urgencyMessage}`,
                contentWidth,
                true,
              ),
            );
          } else {
            const padding = " ".repeat("Urgency:".length + 1);
            result.push(
              createCardLine(`${padding}${line}`, contentWidth, true),
            );
          }
        });
      }
    }
  } else {
    // No due date case
    result.push(
      createCardLine(
        `${colors.bold("Due Date:")} ${colors.meta("No due date set")}`,
        contentWidth,
        true,
      ),
    );
  }

  return result;
};

/**
 * Renders task tags section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @param {number} textWidth - Text width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskTags = (task, contentWidth, textWidth) => {
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

  const result = [];
  tagLines.forEach((line) =>
    result.push(createCardLine(line, contentWidth, true)),
  );
  return result;
};

/**
 * Renders task created date section
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @param {number} textWidth - Text width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskCreated = (task, contentWidth, textWidth) => {
  const createdAt = formatCreatedDate(task.createdAt);
  const cleanCreatedAt = stripAnsi(createdAt);
  const createdLines = wrapText(cleanCreatedAt, textWidth);
  const result = [];

  createdLines.forEach((line, index) => {
    if (index === 0) {
      // First line with label and colored created date
      const coloredLine =
        line === cleanCreatedAt
          ? createdAt +
            ` ${colors.meta(`(${new Date(task.createdAt).toLocaleDateString("ta-LK")})`)}`
          : colors.meta(line);
      result.push(
        createCardLine(
          `${colors.bold("Created:")} ${coloredLine}`,
          contentWidth,
          true,
        ),
      );
    } else {
      // Continuation lines with proper padding
      const padding = " ".repeat("Created:".length + 1);
      result.push(
        createCardLine(`${padding}${colors.meta(line)}`, contentWidth, true),
      );
    }
  });

  return result;
};

/**
 * Renders task subtasks section if present
 * @param {Object} task - Task object
 * @param {number} contentWidth - Content width
 * @param {number} cardWidth - Card width
 * @returns {Array<string>} - Array of formatted lines
 */
const renderTaskSubtasks = (task, contentWidth, cardWidth) => {
  if (!Array.isArray(task.subtasks) || task.subtasks.length === 0) {
    return [];
  }

  const result = [
    createCardLine("", contentWidth),
    `${colors.title(`├─ ${colors.bold("Subtasks:")} ${colors.info(`(${task.subtasks.length} ${task.subtasks.length === 1 ? "item" : "items"})`)} ${"─".repeat(cardWidth - Number(task.subtasks.length === 1 ? 23 : 9 > task.subtasks.length ? 24 : 25))}┤`)}`,
  ];

  task.subtasks.forEach((subtask) => {
    const subStatusIcon = getStatusIcon(subtask.status);
    const maxSubtitleLength = contentWidth - 8; // Account for "   [X] ○ "
    const subtaskLines = wrapText(subtask.title, maxSubtitleLength);

    subtaskLines.forEach((line, index) => {
      if (index === 0) {
        // First line with ID and status icon
        result.push(
          createCardLine(
            `  ${colors.meta(`[${subtask.id}]`)} ${subStatusIcon} ${colors.title(line)}`,
            contentWidth,
            true,
          ),
        );
      } else {
        // Continuation lines with proper indentation
        const indent = "      "; // Space for "  [X] ○ "
        result.push(
          createCardLine(`${indent}${colors.title(line)}`, contentWidth, true),
        );
      }
    });
  });

  return result;
};

/**
 * Renders task footer
 * @param {number} cardWidth - Card width
 * @returns {string} - Formatted footer
 */
const renderTaskFooter = (cardWidth) => {
  return `${colors.title(`└${createBorder("─", cardWidth)}┘`)}\n`;
};

/**
 * Main function to render a complete task card
 * @param {Object} task - Task object to render
 * @returns {void} - Outputs directly to console
 */
export const renderTaskCard = (task) => {
  if (!task) {
    console.log(`${colors.error("✘")} Task not found...`);
    return;
  }

  // Calculate dimensions
  const cardWidth = calculateCardWidth(task);
  const contentWidth = cardWidth - 4;
  const maxLabelWidth = 12;
  const textWidth = contentWidth - maxLabelWidth;

  // Render all sections
  const lines = [];

  // Header
  lines.push(renderTaskHeader(task, cardWidth));

  // Basic info
  lines.push(...renderTaskId(task, contentWidth));
  lines.push(...renderTaskTitle(task, contentWidth, textWidth));
  lines.push(...renderTaskDescription(task, contentWidth, textWidth));
  lines.push(...renderTaskStatus(task, contentWidth));
  lines.push(...renderTaskPriority(task, contentWidth));
  lines.push(...renderTaskDueDate(task, contentWidth, textWidth));
  lines.push(...renderTaskTags(task, contentWidth, textWidth));
  lines.push(...renderTaskCreated(task, contentWidth, textWidth));
  lines.push(...renderTaskSubtasks(task, contentWidth, cardWidth));

  // Footer
  lines.push(createCardLine("", contentWidth));
  lines.push(renderTaskFooter(cardWidth));

  // Output everything
  lines.forEach((line) => {
    if (Array.isArray(line)) {
      line.forEach((subLine) => console.log(subLine));
    } else {
      console.log(line);
    }
  });
};

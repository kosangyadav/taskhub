/**
 * Text formatting and display utilities for TaskHub
 * Handles text wrapping, ANSI code stripping, and multi-line content formatting
 */

import { colors } from "./colors.js";

/**
 * Strips ANSI color codes from a string to get actual text length
 * @param {string} str - String that may contain ANSI codes
 * @returns {string} - Clean string without ANSI codes
 */
export const stripAnsi = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/\x1b\[[0-9;]*m/g, "");
};

/**
 * Gets the actual display length of text (excluding ANSI color codes)
 * @param {string} text - Text to measure
 * @returns {number} - Actual display length
 */
export const getDisplayLength = (text) => stripAnsi(text.toString()).length;

/**
 * Wraps text to fit within specified width while respecting word boundaries
 * Breaks extremely long words into chunks instead of truncating
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width per line
 * @returns {Array<string>} - Array of wrapped lines
 */
export const wrapText = (text, maxWidth) => {
  if (getDisplayLength(text) <= maxWidth) return [text];

  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    // Handle extremely long words by breaking them into chunks
    if (getDisplayLength(word) > maxWidth) {
      // If we have content in current line, push it first
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }

      // Break the long word into chunks
      let remainingWord = word;
      while (remainingWord.length > 0) {
        const chunk = remainingWord.slice(0, maxWidth - 1);
        lines.push(chunk);
        remainingWord = remainingWord.slice(maxWidth);
      }
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (getDisplayLength(testLine) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // This shouldn't happen now since we handle long words above
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

/**
 * Creates a padded line for card-style layouts
 * @param {string} content - Content to display
 * @param {number} width - Total width of the line
 * @param {boolean} isColored - Whether content contains ANSI colors
 * @returns {string} - Padded line with borders
 */
export const createCardLine = (content, width, isColored = false) => {
  // console.log(width);
  const actualLength = isColored ? getDisplayLength(content) : content.length;
  const padding = Math.max(0, width - actualLength);
  const paddingStr = " ".repeat(padding);
  return `${colors.title("│")} ${content}${paddingStr} ${colors.title("│")}`;
};

/**
 * Creates multi-line content with proper indentation for card layouts
 * @param {string} label - Label for the content (e.g., "Title", "Description")
 * @param {string} content - Content to display
 * @param {number} maxWidth - Maximum width for content
 * @param {Function} colorFn - Optional color function to apply to content
 * @returns {Array<string>} - Array of formatted lines
 */
export const createMultiLineContent = (
  label,
  content,
  maxWidth,
  colorFn = null,
) => {
  const lines = [];
  const wrappedLines = wrapText(stripAnsi(content), maxWidth);

  wrappedLines.forEach((line, index) => {
    if (index === 0) {
      // First line with label
      const labelText = `${label}:`;
      const contentText = colorFn ? colorFn(line) : line;
      lines.push(`${labelText} ${contentText}`);
    } else {
      // Continuation lines with padding
      const padding = " ".repeat(label.length + 2);
      const contentText = colorFn ? colorFn(line) : line;
      lines.push(`${padding}${contentText}`);
    }
  });

  return lines;
};

/**
 * Creates a border line for card layouts
 * @param {string} type - Border character (default: "─")
 * @param {number} width - Width of the border
 * @returns {string} - Border line
 */
export const createBorder = (type = "─", width) => {
  return type.repeat(width - 2);
};

/**
 * Truncates text with ellipsis if it exceeds maximum length
 * @param {string} text - Text to potentially truncate
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Truncated text with "..." if needed
 */
export const truncateText = (text, maxLength) => {
  if (!text || getDisplayLength(text) <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

/**
 * Calculates the visual width needed for a terminal table column
 * @param {Array<string>} values - Array of values that will appear in column
 * @param {number} minWidth - Minimum width for the column
 * @param {number} maxWidth - Maximum width for the column
 * @returns {number} - Optimal column width
 */
export const calculateColumnWidth = (values, minWidth = 5, maxWidth = 50) => {
  const maxValueLength = Math.max(
    ...values.map((val) => getDisplayLength(val)),
  );
  return Math.min(Math.max(maxValueLength, minWidth), maxWidth);
};

/**
 * Formats content for table cells with proper padding
 * @param {string} content - Content to format
 * @param {number} width - Cell width
 * @param {string} align - Alignment ('left', 'center', 'right')
 * @returns {string} - Formatted cell content
 */
export const formatTableCell = (content, width, align = "left") => {
  const cleanContent = stripAnsi(content);
  const contentLength = cleanContent.length;

  if (contentLength >= width) {
    return truncateText(content, width);
  }

  const padding = width - contentLength;

  switch (align) {
    case "center":
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return " ".repeat(leftPad) + content + " ".repeat(rightPad);
    case "right":
      return " ".repeat(padding) + content;
    default: // left
      return content + " ".repeat(padding);
  }
};

/**
 * Splits long content into chunks that fit within terminal width
 * @param {string} content - Content to chunk
 * @param {number} terminalWidth - Available terminal width
 * @param {string} prefix - Prefix for continuation lines
 * @returns {Array<string>} - Array of content chunks
 */
export const chunkContent = (content, terminalWidth, prefix = "") => {
  const availableWidth = terminalWidth - getDisplayLength(prefix);
  return wrapText(content, availableWidth).map((line, index) => {
    return index === 0 ? line : `${prefix}${line}`;
  });
};

import fs from "fs";
import os from "os";
import path from "path";

const dirPath = path.join(os.homedir(), ".config", "taskhub");
const filePath = path.join(dirPath, "tasks.json");

export const initStorage = () => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
};

/**
 * Migrates old priority values to new 3-state system
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Migrated tasks array
 */
const migratePriorities = (tasks) => {
  return tasks.map((task) => {
    if (!task.priority) {
      task.priority = "high"; // Default for tasks without priority
      return task;
    }

    // Migration mapping
    switch (task.priority) {
      case "low":
        task.priority = "noise";
        break;
      case "medium":
        task.priority = "high";
        break;
      case "high":
        task.priority = "high";
        break;
      case "top":
        task.priority = "signal";
        break;
      case "signal":
        task.priority = "signal";
        break;
      default:
        // If it's already a new priority value or unknown, keep it or default
        if (!["noise", "high", "signal"].includes(task.priority)) {
          task.priority = "high";
        }
    }

    return task;
  });
};

export const readTasks = () => {
  try {
    const tasks = JSON.parse(fs.readFileSync(filePath, "utf8"));
    // Apply migration to ensure all tasks have new priority values
    return migratePriorities(tasks);
  } catch {
    return [];
  }
};

export const writeTasks = (tasks) => {
  // Ensure all tasks have valid priorities before saving
  const migratedTasks = migratePriorities(tasks);
  fs.writeFileSync(filePath, JSON.stringify(migratedTasks, null, 2));
};

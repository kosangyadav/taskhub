import fs from "fs";
import os from "os";
import path from "path";
import { STORAGE_CONFIG } from "../config/constants.js";

const dirPath = path.join(
  os.homedir(),
  STORAGE_CONFIG.configDir,
  STORAGE_CONFIG.appDir,
);
const filePath = path.join(dirPath, STORAGE_CONFIG.fileName);

export const initStorage = () => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify([], null, STORAGE_CONFIG.jsonIndent),
    );
  }
};

export const readTasks = () => {
  try {
    const rawData = fs.readFileSync(filePath, STORAGE_CONFIG.encoding);
    const tasks = JSON.parse(rawData);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error("Error reading tasks:", error.message);
    return [];
  }
};

export const writeTasks = (tasks) => {
  try {
    // Ensure tasks is an array
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    fs.writeFileSync(
      filePath,
      JSON.stringify(tasksArray, null, STORAGE_CONFIG.jsonIndent),
    );
  } catch (error) {
    console.error("Error writing tasks:", error.message);
    throw error;
  }
};

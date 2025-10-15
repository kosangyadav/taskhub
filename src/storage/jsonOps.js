import fs from "fs";
import os from "os";
import path from "path";

const dirPath = path.join(os.homedir(), ".config", "taskhub");
const filePath = path.join(dirPath, "tasks.json");

export const initStorage = () => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
};

export const readTasks = () => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
};

export const writeTasks = (tasks) => {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
};

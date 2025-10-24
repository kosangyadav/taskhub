import { getDaysDifference, parseDate } from "./timeUtils.js";

/**
 * Checks if a task is overdue
 * @param {string} dueDateStr - Due date string in DD-MM-YYYY format
 * @returns {boolean} - True if task is overdue
 */
export const isOverdue = (dueDateStr) => {
  if (!dueDateStr) return false;
  const date = parseDate(dueDateStr);
  if (!date) return false;
  return getDaysDifference(date) < 0;
};

/**
 * Smart hybrid sorting for tasks with urgency zones
 * Priority: Overdue → Critical Urgency → Priority → Deadline → Status → ID
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Sorted array of tasks
 */
export const smartSortTasks = (tasks) => {
  return [...tasks].sort((a, b) => {
    // 1. Overdue status (overdue items always bubble up)
    const aOverdue = isOverdue(a.due);
    const bOverdue = isOverdue(b.due);
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    // 2. Critical urgency zone (due today/tomorrow gets priority over distant tasks)
    const aDays = a.due ? getDaysDifference(parseDate(a.due)) : Infinity;
    const bDays = b.due ? getDaysDifference(parseDate(b.due)) : Infinity;
    const aCritical = aDays >= 0 && aDays <= 1; // due today or tomorrow
    const bCritical = bDays >= 0 && bDays <= 1;
    if (aCritical !== bCritical) return bCritical - aCritical;

    // 3. Priority (signal > high > noise) - for non-critical items
    const priorityOrder = { signal: 3, high: 2, noise: 1 };
    const aPriority = priorityOrder[a.priority || "high"];
    const bPriority = priorityOrder[b.priority || "high"];
    if (aPriority !== bPriority) return bPriority - aPriority;

    // 4. Deadline urgency (due soon > due later > no deadline)
    if (aDays !== bDays) return aDays - bDays;

    // 5. Status (doing > todo > done)
    const statusOrder = { doing: 3, todo: 2, done: 1 };
    const aStatus = statusOrder[a.status];
    const bStatus = statusOrder[b.status];
    if (aStatus !== bStatus) return bStatus - aStatus;

    // 6. ID (creation order tiebreaker)
    return a.id - b.id;
  });
};

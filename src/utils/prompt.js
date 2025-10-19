import readline from "readline";
import { colors } from "./colors.js";

/**
 * Creates a readline interface for user input
 */
const createInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
};

/**
 * Prompts user for confirmation with a yes/no question
 * @param {string} message - The confirmation message to display
 * @param {boolean} defaultAnswer - Default answer if user just presses Enter (true for yes, false for no)
 * @returns {Promise<boolean>} - Resolves to true if user confirms, false otherwise
 */
export const confirmAction = (message, defaultAnswer = false) => {
  return new Promise((resolve) => {
    const rl = createInterface();

    const defaultText = defaultAnswer ? "Y/n" : "y/N";
    const prompt = `${colors.warn("?")} ${message} ${colors.meta(`(${defaultText})`)} `;

    rl.question(prompt, (answer) => {
      rl.close();

      const normalizedAnswer = answer.trim().toLowerCase();

      // If user just pressed Enter, use default
      if (normalizedAnswer === "") {
        resolve(defaultAnswer);
        return;
      }

      // Handle various yes/no inputs
      const yesAnswers = ["y", "yes", "yeah", "yep", "sure", "ok", "okay"];
      const noAnswers = ["n", "no", "nope", "cancel", "abort"];

      if (yesAnswers.includes(normalizedAnswer)) {
        resolve(true);
      } else if (noAnswers.includes(normalizedAnswer)) {
        resolve(false);
      } else {
        // Invalid input, ask again
        console.log(colors.error("✘ Please answer with yes (y) or no (n)"));
        confirmAction(message, defaultAnswer).then(resolve);
      }
    });
  });
};

/**
 * Prompts user for dangerous action confirmation with extra warning
 * @param {string} action - The action being performed (e.g., "delete all tasks")
 * @param {string} itemDescription - Description of what will be affected
 * @returns {Promise<boolean>} - Resolves to true if user confirms, false otherwise
 */
export const confirmDangerousAction = async (action, itemDescription) => {
  console.log(colors.error(`⚠️  WARNING: You are about to ${action}`));
  console.log(colors.warn(`   This will affect: ${itemDescription}`));
  console.log(colors.meta("   This action cannot be undone!\n"));

  const firstConfirm = await confirmAction(
    `Are you sure you want to ${action}?`,
    false,
  );

  if (!firstConfirm) {
    return false;
  }

  // Double confirmation for very dangerous actions
  if (action.includes("all") || action.includes("everything")) {
    const secondConfirm = await confirmAction(
      colors.error("Are you ABSOLUTELY sure? This will remove EVERYTHING!"),
      false,
    );
    return secondConfirm;
  }

  return true;
};

/**
 * Shows a simple confirmation message after an action is cancelled
 */
export const showCancellationMessage = () => {
  console.log(colors.error("✘ Operation cancelled. No changes were made.\n"));
};

/**
 * Prompts user to select from multiple options
 * @param {string} question - The question to ask
 * @param {Array<string>} options - Array of option strings
 * @param {number} defaultIndex - Default option index (0-based)
 * @returns {Promise<number>} - Resolves to the selected option index
 */
export const selectOption = (question, options, defaultIndex = 0) => {
  return new Promise((resolve) => {
    const rl = createInterface();

    console.log(colors.title(`\n${question}`));
    options.forEach((option, index) => {
      const marker = index === defaultIndex ? colors.success("►") : " ";
      console.log(`${marker} ${colors.info(`${index + 1}.`)} ${option}`);
    });

    const prompt = `\n${colors.warn("?")} Select an option ${colors.meta(`(1-${options.length}, default: ${defaultIndex + 1})`)} `;

    rl.question(prompt, (answer) => {
      rl.close();

      const normalizedAnswer = answer.trim();

      // If user just pressed Enter, use default
      if (normalizedAnswer === "") {
        resolve(defaultIndex);
        return;
      }

      const selection = parseInt(normalizedAnswer, 10) - 1;

      if (isNaN(selection) || selection < 0 || selection >= options.length) {
        console.log(
          colors.error(
            `✘ Please enter a number between 1 and ${options.length}`,
          ),
        );
        selectOption(question, options, defaultIndex).then(resolve);
      } else {
        resolve(selection);
      }
    });
  });
};

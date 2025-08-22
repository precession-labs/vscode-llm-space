/**
 * VSCode message utils.
 */

import * as vscode from "vscode";

/**
 * Display a message to the VSCode status bar.
 *
 * @param message The message to show.
 * @param hideAfterTimeout Timeout in milliseconds after which the message will be cleared.
 */
export function status(message: string, hideAfterTimeout?: number): void {
  clearSpinner();

  if (hideAfterTimeout) {
    vscode.window.setStatusBarMessage("");
    vscode.window.setStatusBarMessage(message, hideAfterTimeout);
  } else {
    vscode.window.setStatusBarMessage(message);
  }
}

/**
 * Display an `info` message to the VSCode status bar and auto-hide after `4000` milliseconds.
 *
 * @param message The message to show.
 */
export function statusInfo(message: string): void {
  status(message, 4000);
}

/**
 * Display an `error` message to the VSCode status bar and auto-hide after `8000` milliseconds.
 *
 * @param message The message to show.
 */
export function statusError(message: string): void {
  status(message, 8000);
}

/**
 * Display an `fatal` message to the VSCode status bar and auto-hide after `12000` milliseconds.
 *
 * @param message The message to show.
 */
export function statusFatal(message: string): void {
  status(message, 12000);
}

/**
 * Show a confirm prompt dialog.
 */
export function showConfirmBox(message: string, ...buttons: string[]) {
  return vscode.window.showInformationMessage(message, ...buttons);
}

let spinnerTimer: NodeJS.Timeout | null;
const spinner = {
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  interval: 100
};

/**
 * Display a message with spinner and progress.
 *
 * @param message Message to display after spinner.
 * @param progress Current progress.
 * @param total Total progress.
 */
export function showSpinner(message: string, progress?: number, total?: number): void {
  clearSpinner();

  let text = "";
  if (progress != null && total != null) {
    text = `[${progress}/${total}]`;
  }

  text = text ? `${text} ${message}` : message;

  if (text) {
    text = ` ${text.trim()}`;
  }

  let step = 0;
  const frames: string[] = spinner.frames;
  const length: number = frames.length;
  spinnerTimer = setInterval(() => {
    vscode.window.setStatusBarMessage(`${frames[step]}${text}`);
    step = (step + 1) % length;
  }, spinner.interval);
}

/**
 * Clear the spinner and displays the message, do nothing if currently there's no any spinner.
 *
 * @param message The message to show.
 */
export function clearSpinner(message?: string): void {
  if (spinnerTimer) {
    clearInterval(spinnerTimer);
    spinnerTimer = null;

    if (message != null) {
      vscode.window.setStatusBarMessage(message);
    }
  }
}

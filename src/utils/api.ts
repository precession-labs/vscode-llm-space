/**
 * VSCode API utils.
 */

import * as vscode from "vscode";

/**
 * Open file in VSCode editor.
 *
 * @param filepath The full path of the file.
 */
export function openFile(filepath: string) {
  vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filepath));
}

/**
 * Reload VSCode window.
 */
export function reloadWindow() {
  vscode.commands.executeCommand("workbench.action.reloadWindow");
}

/**
 * Register extension command on VSCode.
 */
export function registerCommand(context: vscode.ExtensionContext, command: string, callback: () => void) {
  // Add to a list of disposables which are disposed when this extension is deactivated.
  context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

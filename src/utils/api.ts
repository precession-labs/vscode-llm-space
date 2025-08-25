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
 * Gets the setting from `VSCode User Settings`.
 *
 * Example:
 * ```ts
 * const theme = api.getVSCodeSetting("workbench", "colorTheme");
 * ```
 */
export function getVSCodeSetting<T>(section: string, key: string, defaultValue?: T): T {
  return vscode.workspace.getConfiguration(section).get<T>(key, defaultValue as T);
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
export function registerCommand(
  context: vscode.ExtensionContext,
  command: string,
  callback: (...args: unknown[]) => void
) {
  context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

/**
 * Register extension webview view provider on VSCode.
 */
export function registerWebviewViewProvider(
  context: vscode.ExtensionContext,
  viewId: string,
  provider: vscode.WebviewViewProvider
) {
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(viewId, provider));
}

/**
 * Get current color theme info.
 */
export function getCurrentColorTheme() {
  return {
    kind: vscode.window.activeColorTheme.kind,
    name: getVSCodeSetting("workbench", "colorTheme")
  };
}

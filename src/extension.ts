import * as vscode from "vscode";

import { api } from "./utils";
import { MainWebviewViewProvider } from "./views";

export async function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new MainWebviewViewProvider(context);
  _registerCommands(context, webviewProvider);
  _registerFileWatcher(context, webviewProvider);
}

export function deactivate() {}

function _registerCommands(
  context: vscode.ExtensionContext,
  webviewProvider: MainWebviewViewProvider
) {
  api.registerWebviewViewProvider(context, "vls_container_webview", webviewProvider);
  api.registerCommand(context, "vls.openWebview", async (uri?: vscode.Uri) => {
    const targetFile = uri?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!targetFile) {
      return;
    }
    await vscode.commands.executeCommand("vls_container_webview.focus");
    await webviewProvider.open(targetFile);
  });
}

function _registerFileWatcher(
  context: vscode.ExtensionContext,
  webviewProvider: MainWebviewViewProvider
) {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(
      async editor => {
        if (editor?.document.languageId === "markdown") {
          await webviewProvider.open(editor.document.uri.fsPath);
        }
      }
    )
  );
}

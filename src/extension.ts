import * as vscode from "vscode";

import { api } from "./utils";
import { MAIN_WEBVIEW_VIEW_PROVIDER_VIEW_ID, MainWebviewViewProvider } from "./views";

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
  api.registerWebviewViewProvider(context, MAIN_WEBVIEW_VIEW_PROVIDER_VIEW_ID, webviewProvider);
  api.registerCommand(context, "vls.openWebview", async (uri?: vscode.Uri) => {
    const targetFile = uri?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!targetFile) {
      return;
    }
    await webviewProvider.focus();
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

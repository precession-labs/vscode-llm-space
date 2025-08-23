import * as vscode from "vscode";
import type { ExtensionContext } from "vscode";

import { api } from "./utils";
import { MyWebviewViewProvider } from "./views";

export async function activate(context: ExtensionContext) {
  const viewProvider = new MyWebviewViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "vls_container_webview",
      viewProvider
    )
  );

  _registerCommands(context, viewProvider);
  _registerFileWatcher(context, viewProvider);
}

export function deactivate() {}

function _registerCommands(
  context: ExtensionContext,
  viewProvider: MyWebviewViewProvider
) {
  api.registerCommand(context, "vls.openWebview", async (uri?: vscode.Uri) => {
    const targetFile = uri?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!targetFile) {
      return;
    }
    await vscode.commands.executeCommand("vls_container_webview.focus");
    await viewProvider.open(targetFile);
  });
}

function _registerFileWatcher(context: ExtensionContext, viewProvider: MyWebviewViewProvider) {
  const disposable = vscode.window.onDidChangeActiveTextEditor(
    async editor => {
      if (editor && editor.document.languageId === "markdown") {
        await viewProvider.open(editor.document.uri.fsPath);
      }
    }
  );
  context.subscriptions.push(disposable);
}

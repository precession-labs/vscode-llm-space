import type { ExtensionContext } from "vscode";

import { api, toast } from "./utils";

export function activate(context: ExtensionContext) {
  _registerCommands(context);
}

export function deactivate() {
}

function _registerCommands(context: ExtensionContext) {
  api.registerCommand(context, "vls.log", _log);
}

function _log() {
  toast.statusInfo("Hello World");
}

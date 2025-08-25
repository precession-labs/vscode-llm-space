import { randomUUID } from "node:crypto";
import path from "node:path";
import { Stream } from "openai/streaming";
import * as rpc from "typed-rpc/server";
import * as vscode from "vscode";

import { GatewayService } from "../gateway";
import { ThreadService } from "../threading";
import { env, toast } from "../utils";

export class MainWebviewViewProvider implements vscode.WebviewViewProvider {
  private readonly _context: vscode.ExtensionContext;
  private readonly _threadService: ThreadService;
  private readonly _gatewayService: GatewayService;

  private _isReady = false;
  private _activeFile?: string;
  private _webviewView?: vscode.WebviewView;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._threadService = new ThreadService(this._context);
    this._gatewayService = new GatewayService(this._context);
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._webviewView = webviewView;
    const { webview } = webviewView;

    const resourcesPath = path.join(this._context.extensionPath, "resources");
    webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(resourcesPath)] // Allow loading local resources.
    };
    if (env.IS_DEV) {
      webview.html = this.buildDevHtml();
    } else {
      webview.html = this.buildProdHtml(
        webview.cspSource,
        webview.asWebviewUri(vscode.Uri.file(resourcesPath))
      );
    }

    this._registerRPC(webview);
    this._registerFileWatcher(webview);
  }

  async open(filepath: string) {
    if (!this._isReady) {
      await vscode.commands.executeCommand("vls_container_webview.focus");
    }
    const thread = await this._threadService.readThread(filepath);
    this._webviewView?.webview.postMessage({
      namespace: "vls.command.open",
      type: "command",
      data: {
        thread,
        resource: filepath
      }
    });
    this._activeFile = filepath;
  }

  private _registerRPC(webview: vscode.Webview) {
    webview.onDidReceiveMessage(async e => {
      // TODO: fix type.
      const { namespace, type, data } = e as {
        namespace: string;
        type: string;
        data: {
          id?: string;
          method?: string;
        };
      };
      if (namespace === "vls.event.webview.loaded") {
        this._onWebviewLoaded();
        return;
      }
      if (type !== "json-rpc") {
        return;
      }
      let result;
      if (namespace === "vls.rpc/fs") {
        result = await rpc.handleRpc<rpc.RpcService<ThreadService, unknown>>(
          data,
          this._threadService,
          {
            onError: (err: unknown) => {
              console.error(`RPC.ERROR[fs.${data.method}] ${data.id}`, err);
            }
          }
        );
      } else if (namespace === "vls.rpc/gateway") {
        result = await rpc.handleRpc<rpc.RpcService<GatewayService, unknown>>(
          data,
          this._gatewayService
        );
      } else {
        console.error(`RPC.ERROR[${namespace}.${type}] ${data.id}`, {
          namespace,
          type,
          data
        });
      }

      if (result) {
        if ("result" in result && result.result instanceof Stream) {
          webview.postMessage({
            namespace,
            type: "json-rpc",
            data: { id: data.id, stream: true }
          });
          for await (const chunk of result.result) {
            webview.postMessage({
              namespace,
              type: "json-rpc",
              data: { id: data.id, done: false, value: chunk }
            });
          }
          webview.postMessage({
            namespace,
            type,
            data: { id: data.id, done: true }
          });
        } else {
          webview.postMessage({
            namespace,
            type: "json-rpc",
            data: result
          });
        }
      }
    });
  }

  private _registerFileWatcher(webview: vscode.Webview) {
    this._context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(event => {
        const changedFile = event.document.uri.fsPath;
        if (this._activeFile != null && changedFile === this._activeFile) {
          webview.postMessage({
            namespace: "vls.event.file.changed",
            type: "event",
            data: {
              resource: changedFile,
              content: event.document.getText()
            }
          });
        }
      })
    );
  }

  private _onWebviewLoaded() {
    toast.statusInfo("LLM Space is ready");
    this._isReady = true;
    const currentDocument = vscode.window.activeTextEditor?.document;
    if (currentDocument?.languageId === "markdown") {
      this.open(currentDocument.uri.fsPath).catch(() => {});
    }
  }

  private buildProdHtml(cspSource: string, baseUri: vscode.Uri): string {
    const nonce = Buffer.from(randomUUID()).toString("base64");
    return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src none; script-src ${cspSource} 'unsafe-eval'; style-src ${cspSource} 'unsafe-inline'; img-src * data:;">
  <base href="${baseUri.toString()}/">
  <title>LLM Space Extension</title>
  <link rel="stylesheet" href="web/index.css" nonce="${nonce}">
</head>

<body>
  <div id="root"></div>
  <script type="module" src="web/index.js" nonce="${nonce}"></script>
</body>

</html>
`;
  }

  private buildDevHtml(): string {
    return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LLM Space Extension</title>
</head>

<body>
  <div id="root"></div>
  <script type="module">
    import RefreshRuntime from 'http://localhost:5173/@react-refresh';
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => { };
    window.$RefreshSig$ = () => (type) => type;
    window.__vite_plugin_react_preamble_installed__ = true;
  </script>
  <script type="module" src="http://localhost:5173/src/extension/index.tsx"></script>
</body>

</html>
`;
  }
}

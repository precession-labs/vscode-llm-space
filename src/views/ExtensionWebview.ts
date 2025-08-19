import * as vscode from "vscode";
import * as rpc from "typed-rpc/server";

import { GatewayService } from "../gateway";
import { ThreadService } from "../threading";
import { Stream } from "openai/streaming";
import { toast } from '../utils';

export class MyWebviewViewProvider implements vscode.WebviewViewProvider {
  private _webviewView?: vscode.WebviewView;

  private readonly _threadService: ThreadService;
  private readonly _gatewayService: GatewayService;

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._threadService = new ThreadService(this._context);
    this._gatewayService = new GatewayService(this._context);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._webviewView = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getWebviewContent();
    this.registerRpc(webviewView.webview);
  }

  onWebviewLoaded() {
    toast.statusInfo("LLM Space is ready");

    const currentDocument = vscode.window.activeTextEditor?.document;
    if (currentDocument && currentDocument.languageId === "markdown") {
      this.open(currentDocument.uri.fsPath);
    }
  }

  registerRpc(webview: vscode.Webview) {
    webview.onDidReceiveMessage(async (e) => {
      const { namespace, type, data } = e;
      if (namespace === "vls.webview.loaded") {
        this.onWebviewLoaded();
        return;
      }
      if (type !== "json-rpc") {
        return;
      }
      let result;
      if (namespace === "vls.rpc/fs") {
        result = await rpc.handleRpc<rpc.RpcService<ThreadService, any>>(
          data,
          this._threadService,
          {
            onError: (err: any) => {
              console.error(`RPC.ERROR[fs.${data.method}] ${data.id}`, err);
            },
          }
        );
      } else if (namespace === "vls.rpc/gateway") {
        result = await rpc.handleRpc<rpc.RpcService<GatewayService, any>>(
          data,
          this._gatewayService
        );
      } else {
        console.error(`RPC.ERROR[${namespace}.${type}] ${data.id}`, {
          namespace,
          type,
          data,
        });
      }

      if (result) {
        if ("result" in result && result.result instanceof Stream) {
          for await (const chunk of result.result) {
            webview.postMessage({
              namespace,
              type: "json-rpc",
              data: { id: data.id, done: false, value: chunk },
            });
          }
          webview.postMessage({
            namespace,
            type,
            data: { id: data.id, done: true },
          });
        } else {
          webview.postMessage({
            namespace,
            type: "json-rpc",
            data: result,
          });
        }
      }
    });
  }

  async open(filePath: string) {
    console.log("open file", filePath);
    const thread = await this._threadService.readThread(filePath);
    this._webviewView?.webview.postMessage({
      namespace: "vls.command.open",
      type: "command",
      data: {
        thread,
        resource: filePath,
      },
    });
  }

  private getWebviewContent(): string {
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

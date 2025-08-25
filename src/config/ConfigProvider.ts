import { join } from "node:path";
import type { ExtensionContext } from "vscode";

import type { Config, Provider } from "./config";
import { loadConfig, saveConfig } from "./loader";

export class ConfigProvider {
  private _filepath: string;
  private _config?: Config;

  constructor(context: ExtensionContext) {
    this._filepath = join(context.globalStorageUri.fsPath, "config.yaml");
  }

  get config() {
    if (!this._config) {
      this._config = loadConfig(this._filepath);
    }
    return this._config;
  }

  get(providerName: string): Provider | undefined {
    return this.config.providers.find(p => p.name === providerName);
  }

  save(config: Config) {
    saveConfig(this._filepath, config);
    this._config = config;
    return config;
  }
}

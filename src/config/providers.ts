import { join } from "path";
import type { Config, Provider } from "./config";
import { loadYamlConfig, saveYamlConfig } from "./loader";

export const ConfigProvider = {
  _path: null as string | null,
  _config: null as Config | null,

  get config() {
    if (!this._config) {
      throw new Error("Config not loaded");
    }
    return this._config;
  },

  load(basePath: string) {
    const filePath = join(basePath, "config.yaml");
    this._path = filePath;
    this._config ??= loadYamlConfig(filePath);
    return this._config;
  },

  get(name: string): Provider {
    const provider = this.config.providers.find(p => p.name === name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return provider;
  },

  update(config: Config) {
    if (!this._path) {
      throw new Error("Config not loaded");
    }
    this._config = config;
    saveYamlConfig(config, this._path);
  },

  get all() {
    return this.config?.providers ?? [];
  },

  get defaults() {
    return {
      provider: this.config.provider,
      model: this.config.model
    };
  }
};

import * as fs from "node:fs";

import { dump, load } from "js-yaml";

import type { Config } from "./config";

export function loadConfig(filepath: string): Config {
  try {
    // console.log("[config] load config from", configFile);
    return load(fs.readFileSync(filepath, "utf8")) as Config;
  } catch {
    // console.error(e);
    return { providers: [] };
  }
}

export function saveConfig(filepath: string, config: Config) {
  try {
    // 确保目标目录存在
    const dir = filepath.substring(0, filepath.lastIndexOf("/"));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, dump(config, { indent: 2 }));
  } catch (e) {
    // console.error(e);
    throw e;
  }
}

import * as fs from "node:fs";

import { dump, load } from "js-yaml";

import type { Config } from "./config";

export const loadYamlConfig = (configFile: string) => {
  // console.log("[config] load config from", configFile);
  const config = load(fs.readFileSync(configFile, "utf8")) ?? { providers: [] };
  return config as Config;
};

export const saveYamlConfig = (config: Config, configFile: string) => {
  try {
    // 确保目标目录存在
    const dir = configFile.substring(0, configFile.lastIndexOf("/"));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configFile, dump(config, { indent: 2 }));
  } catch (e) {
    // console.error(e);
    throw e;
  }
};

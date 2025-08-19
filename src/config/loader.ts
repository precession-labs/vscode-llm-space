import * as fs from "node:fs";

import { dump, load } from "js-yaml";

import type { Config } from "./config";

export const loadYamlConfig = (configFile: string) => {
  console.log("loadYamlConfig", configFile);
  // const config = load(fs.readFileSync(configFile, "utf8")) ?? { providers: [] };
  const config = load(`
provider: openai
model: gpt-4o-mini
providers:
  - name: openai
    baseURL: https://api.openai.com/v1
    envKey: OPENAI_API_KEY
    models:
      - id: gpt-4o
  - name: local
    baseURL: http://127.0.0.1:1234/v1
    models:
      - id: openai/gpt-oss-20b
        maxTokens: 2048
`);
  return config as Config;
};

export const saveYamlConfig = (config: Config, configFile: string) => {
  fs.writeFileSync(configFile, dump(config, { indent: 2 }));
};

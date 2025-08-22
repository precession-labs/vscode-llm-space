import { ESLINT_CONFIGS } from "eslint-config-zoro/eslint";
import { NODE_CONFIGS } from "eslint-config-zoro/node";
import { STYLISTIC_CONFIGS } from "eslint-config-zoro/stylistic";
import { TYPESCRIPT_CONFIGS } from "eslint-config-zoro/typescript";
import * as globals from "globals";

export default [
  { ignores: ["dist/*", "resources/*"] },
  ...ESLINT_CONFIGS,
  ...NODE_CONFIGS,
  ...STYLISTIC_CONFIGS,
  ...TYPESCRIPT_CONFIGS,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      ecmaVersion: 5,
      sourceType: "commonjs",
      parserOptions: {
        project: "./tsconfig.eslint.json"
      }
    },
    rules: {
      "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      "@stylistic/indent-binary-ops": ["error", 2],
      "@stylistic/indent": ["error", 2, { "SwitchCase": 1 }]
    }
  }
];

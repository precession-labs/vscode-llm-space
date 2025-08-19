import type { FunctionDefinition } from "openai/resources";

/**
 * The definition of a function tool.
 */
export interface FunctionTool {
  function: FunctionDefinition;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type: "function";
}

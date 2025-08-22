import type { JSONSchema } from "openai/lib/jsonschema.js";
import type { ResponseFormatJSONObject, ResponseFormatJSONSchema, ResponseFormatText } from "openai/resources";

import type { Message } from "./messaging";
import type { Counter } from "./tokenizing/counters";
import type { FunctionTool } from "./tooling";

/**
 * A thread is a collection of messages with a bunch of parameters.
 */
export interface Thread {
  /**
   * The unique identifier for the thread.
   */
  id: string;

  /**
   * The messages in the thread, including the system message and message from the user, assistant and tool.
   * The system message should be the first message in the array if exists.
   */
  messages: Message[];

  /**
   * The tools to use for the thread.
   */
  tools?: FunctionTool[];

  /**
   * The name of the model to use for the thread.
   */
  model?: string;

  /**
   * The provider of the model to use for the thread.
   */
  model_provider?: string;

  /**
   * The maximum number of tokens to generate.
   */
  max_tokens?: number | null;

  /**
   * The temperature to use for the thread.
   */
  temperature?: number | null;

  /**
   * The top p to use for the thread.
   */
  top_p?: number | null;

  /**
   * The response format to use for the thread.
   */
  response_format?:
    | ResponseFormatText
    | ResponseFormatJSONObject
    | ResponseFormatJSONSchema;

  /**
   * The JSON schema to use for the thread.
   */
  json_schema?: JSONSchema;

  /**
   * The extra information for the thread.
   */
  extra?: {
    counter?: Counter;
  };
}

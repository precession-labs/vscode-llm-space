/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { ChatCompletionChunk } from "openai/resources";

import type { AssistantMessage, MessageChunk } from ".";

export function messageReducer(
  message: AssistantMessage,
  chunk: MessageChunk
): AssistantMessage {
  const choice = chunk.choices[0];
  if (!choice) {
    return message;
  }
  return reduce(message, choice.delta) as AssistantMessage;
}

function reduce(acc: any, delta: ChatCompletionChunk.Choice.Delta) {
  const result = { ...acc };
  for (const [key, value] of Object.entries(delta)) {
    if (result[key] == null) {
      result[key] = value;
      if (Array.isArray(result[key])) {
        for (const arr of result[key]) {
          delete arr.index;
        }
      }
    } else if (
      key !== "role"
      && typeof result[key] === "string"
      && typeof value === "string"
    ) {
      result[key] += value;
    } else if (typeof result[key] === "number" && typeof value === "number") {
      result[key] = value;
    } else if (Array.isArray(result[key]) && Array.isArray(value)) {
      const accArray = result[key];
      for (const { index, ...chunkTool } of value) {
        if (index - accArray.length > 1) {
          throw new Error(
            `Error: An array has an empty value when tool_calls are constructed. tool_calls: ${accArray.toString()}; tool: ${value.toString()}`
          );
        }
        accArray[index] = reduce(accArray[index], chunkTool);
      }
    } else if (typeof result[key] === "object" && typeof value === "object") {
      result[key] = reduce(result[key], value);
    }
  }
  return result;
}

import type { ChatCompletionChunk } from "openai/resources";

import type { AssistantMessage, MessageChunk } from ".";

export function messageReducer(
  message: AssistantMessage,
  chunk: MessageChunk,
): AssistantMessage {
  const choice = chunk.choices[0];
  if (!choice) {
    return message;
  }
  return reduce(message, choice.delta) as AssistantMessage;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reduce(acc: any, delta: ChatCompletionChunk.Choice.Delta) {
  acc = { ...acc };
  for (const [key, value] of Object.entries(delta)) {
    if (acc[key] === undefined || acc[key] === null) {
      acc[key] = value;
      if (Array.isArray(acc[key])) {
        for (const arr of acc[key]) {
          delete arr.index;
        }
      }
    } else if (
      key !== "role" &&
      typeof acc[key] === "string" &&
      typeof value === "string"
    ) {
      acc[key] += value;
    } else if (typeof acc[key] === "number" && typeof value === "number") {
      acc[key] = value;
    } else if (Array.isArray(acc[key]) && Array.isArray(value)) {
      const accArray = acc[key];
      for (const { index, ...chunkTool } of value) {
        if (index - accArray.length > 1) {
          throw new Error(
            `Error: An array has an empty value when tool_calls are constructed. tool_calls: ${accArray.toString()}; tool: ${value.toString()}`,
          );
        }
        accArray[index] = reduce(accArray[index], chunkTool);
      }
    } else if (typeof acc[key] === "object" && typeof value === "object") {
      acc[key] = reduce(acc[key], value);
    }
  }
  return acc;
}

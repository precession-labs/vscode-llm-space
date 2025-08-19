import type {
  ChatCompletionContentPart,
  ChatCompletionMessageToolCall,
} from "openai/resources";

export interface GenericMessage<R extends string, C> {
  id: string;
  role: R;
  content: C;
}

export interface SystemMessage extends GenericMessage<"system", string> {}

export interface UserMessage
  extends GenericMessage<"user", string | Array<ChatCompletionContentPart>> {}

export interface AssistantMessage
  extends GenericMessage<"assistant", string | null> {
  reasoning_content?: string;
  tool_calls?: Array<ChatCompletionMessageToolCall>;
}

export interface ToolMessage extends GenericMessage<"tool", string> {
  tool_call_id: string;
}

export type NonSystemMessage = UserMessage | AssistantMessage | ToolMessage;

export type Message =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolMessage;

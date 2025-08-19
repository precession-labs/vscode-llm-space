import type { ChatCompletionChunk } from "openai/resources";
import type { Stream } from "openai/streaming";

export interface MessageChunk extends ChatCompletionChunk {}

export type MessageChunkStream = Stream<MessageChunk>;

export interface Counter {
  messages: Record<string, MessageCounter>;
}

export interface MessageCounter {
  token_used: number;

  latency: MessageLatency;
}

export interface MessageLatency {
  /**
   * 总时间
   */
  duration?: number;

  /**
   * 执行器消耗的时间
   */
  execution?: number;

  /**
   * Time To First Token
   */
  ttft?: number;
}

/**
 * Initialize or update the counter for a specific message
 */
export function updateMessageCounter(
  counter: Counter,
  messageId: string,
  updates: Partial<MessageCounter>,
): void {
  counter.messages[messageId] ??= {
    token_used: 0,
    latency: {},
  };

  const messageCounter = counter.messages[messageId];

  if (updates.token_used !== undefined) {
    messageCounter.token_used = updates.token_used;
  }

  if (updates.latency) {
    messageCounter.latency = {
      ...messageCounter.latency,
      ...updates.latency,
    };
  }
}

/**
 * Initialize counter if it doesn't exist
 */
export function ensureCounter(thread: {
  extra?: { counter?: Counter };
}): Counter {
  thread.extra ??= {};
  thread.extra.counter ??= {
    messages: {},
  };

  return thread.extra.counter;
}

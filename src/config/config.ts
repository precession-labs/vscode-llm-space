export interface Config {
  provider?: string;
  model?: string;

  providers: Provider[];
}

export interface Provider {
  name: string;
  baseURL: string;
  apiKey?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;

  models?: Model[];
}

export interface Model {
  id: string;
  maxTokens?: number;
}

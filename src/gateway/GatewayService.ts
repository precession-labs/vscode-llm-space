import { OpenAI } from "openai";
import type { ChatCompletionCreateParamsStreaming } from "openai/resources";

import type { Config, ConfigProvider, Model } from "../config";

export class GatewayService {
  private readonly _configProvider: ConfigProvider;

  constructor(configProvider: ConfigProvider) {
    this._configProvider = configProvider;
  }

  async getProviders() {
    return this._configProvider.config;
  }

  async saveProviders(config: Config): Promise<Config> {
    return this._configProvider.save(config);
  }

  async getModels(): Promise<Model[]> {
    return this._configProvider.config.providers.flatMap(
      provider =>
        (provider.models ?? []).map(m => {
          return {
            id: m.id,
            owned_by: provider.name
          };
        })
    );
  }

  async createChatCompletionStream(
    params: ChatCompletionCreateParamsStreaming,
    options: { threadId: string; provider?: string; }
  ) {
    const providerName = options.provider ?? this._configProvider.config.provider ?? "";
    const provider = this._configProvider.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const headers = Object.keys(provider.headers ?? {}).reduce<Record<string, string>>(
      (acc, key) => {
        const value = provider.headers?.[key]?.trim();
        if (value?.startsWith("${") && value.endsWith("}")) {
          acc[key] = process.env[value.slice(2, -1)] ?? "";
        } else {
          acc[key] = value ?? "";
        }
        return acc;
      },
      {}
    );
    const openai = new OpenAI({
      baseURL: provider.baseURL,
      apiKey: provider.apiKey ?? "NO_API_KEY",
      defaultHeaders: headers,
      defaultQuery: provider.query
    });
    // console.log(`[gateway] ${provider.name}/${params.model} chat completion request.`, params);
    return await openai.chat.completions.create({
      ...params,
      stream: true
    });
  }
}

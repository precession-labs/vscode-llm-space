import { OpenAI } from "openai";
import { ChatCompletionCreateParamsStreaming } from "openai/resources";
import type { ExtensionContext } from "vscode";
import { Config, Model } from "../config";
import { ConfigProvider } from "../config/providers";

export class GatewayService {
  constructor(private readonly context: ExtensionContext) {}

  async getProviders(): Promise<Config> {
    const config = await ConfigProvider.load(
      this.context.globalStorageUri.fsPath
    );
    return config;
  }

  async createChatCompletionStream(
    params: ChatCompletionCreateParamsStreaming,
    options: { threadId: string; provider: string; }
  ) {
    await ConfigProvider.load(this.context.globalStorageUri.fsPath);

    const provider = ConfigProvider.get(
      options.provider ?? ConfigProvider.defaults.provider ?? ""
    );
    const baseURL = provider.baseURL;
    const apiKey = provider.apiKey ?? "NO_API_KEY";
    const headers = Object.keys(provider.headers ?? {}).reduce(
      (acc: Record<string, string>, key) => {
        const value = provider.headers?.[key]?.trim();
        if (value?.startsWith("${") && value.endsWith("}")) {
          acc[key] = process.env[value.slice(2, -1)] ?? "";
        } else {
          acc[key] = value ?? "";
        }
        return acc;
      },
      {} as Record<string, string>
    );
    const openai = new OpenAI({
      baseURL,
      apiKey,
      defaultHeaders: headers,
      defaultQuery: provider.query
    });
    const stream = await openai.chat.completions.create({
      ...params,
      stream: true
    });
    return stream;
  }

  saveProviders(config: Config): Promise<Config> {
    ConfigProvider.update(config);
    return Promise.resolve(config);
  }

  async getModels(): Promise<Model[]> {
    const config = await ConfigProvider.load(
      this.context.globalStorageUri.fsPath
    );
    const models = config.providers.flatMap(provider =>
      (provider.models ?? []).map(m => {
        return {
          id: m.id,
          owned_by: provider.name
        };
      })
    );
    return models;
  }
}

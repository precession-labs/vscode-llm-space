import * as fs from "fs/promises";
import path from "node:path";
import { v7 as generateUUID } from "uuid";
import type { ExtensionContext } from "vscode";

import type { ConfigProvider } from "../config";
import { FileType, URI } from "../filesystem";
import type { Stat } from "../filesystem";
import { createMD5 } from "../utils";
import type { Thread } from "./common";

export class ThreadService {
  private readonly _baseDir: string;
  private readonly _configProvider: ConfigProvider;

  constructor(context: ExtensionContext, configProvider: ConfigProvider) {
    this._baseDir = context.globalStorageUri.fsPath;
    this._configProvider = configProvider;
  }

  /**
   * Read the thread content
   *
   * @param resource The thread URI
   */
  async readThread(resource: string): Promise<Thread | null> {
    const uri = new URI(resource);
    const threadId = createMD5(uri.toString());
    const prompt = await fs.readFile(uri.path.fsPath(), "utf-8");
    const latest = await this.getLatestSnapshotId(threadId);
    if (!latest) {
      return {
        id: threadId,
        model: this._configProvider.config.model,
        model_provider: this._configProvider.config.provider,
        temperature: 1,
        top_p: 1,
        messages: [
          {
            id: generateUUID(),
            role: "system",
            content: prompt
          }
        ]
      };
    }

    await this._ensureDir(path.join(this._baseDir, threadId));
    const content = await fs.readFile(path.join(this._baseDir, threadId, latest), "utf-8");
    const thread = JSON.parse(content) as Thread;
    if (thread.messages.length === 0) {
      thread.messages.push({
        id: generateUUID(),
        role: "system",
        content: prompt
      });
    } else {
      const system = thread.messages.find(m => m.role === "system");
      if (system) {
        system.content = prompt;
      }
    }
    return thread;
  }

  /**
   * Write the thread content
   * @param resource The thread URI
   * @param thread The thread content
   */
  async writeThread(resource: string, thread: Thread): Promise<Stat | null> {
    const uri = new URI(resource);
    const threadId = createMD5(uri.toString());
    thread.id = threadId;
    const dir = path.join(this._baseDir, threadId);
    await this._ensureDir(dir);
    const file = path.join(dir, `${generateUUID()}.json`);
    await fs.writeFile(file, JSON.stringify(thread, null, 2));
    return {
      name: threadId,
      type: FileType.File,
      size: 0,
      mtime: Date.now()
    };
  }

  private async getLatestSnapshotId(threadId: string): Promise<string | null> {
    const dir = path.join(this._baseDir, threadId);
    await this._ensureDir(dir);
    const files = await fs.readdir(dir);
    if (files.length === 0) {
      return null;
    }
    return files.sort().pop() ?? null;
  }

  private async _ensureDir(_path: string) {
    try {
      await fs.stat(_path);
    } catch {
      await fs.mkdir(_path, { recursive: true });
    }
  }
}

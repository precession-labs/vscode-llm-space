import * as fs from "fs/promises";
import type { ExtensionContext } from "vscode";

import { v7 as uuidv7 } from "uuid";
import { FileType, Stat, URI } from "../filesystem/common";
import { md5 } from "../utils/md5";
import { Thread } from "./common";
import path = require("path");
import { ConfigProvider } from "../config/providers";

export class ThreadService {
  constructor(private readonly context: ExtensionContext) {}

  get baseDir() {
    return this.context.storageUri?.fsPath;
  }

  /**
   * Read the thread content
   * @param resource The thread URI
   */
  async readThread(resource: string): Promise<Thread | null> {
    const uri = new URI(resource);
    const threadId = md5(uri.toString());
    const prompt = await fs.readFile(uri.path.fsPath(), "utf-8");
    const latest = await this.getLatestSnapshotId(threadId);
    if (!latest || !this.baseDir) {
      return {
        id: threadId,
        model: ConfigProvider.defaults.model,
        model_provider: ConfigProvider.defaults.provider,
        messages: [
          {
            id: uuidv7(),
            role: "system",
            content: prompt
          }
        ]
      };
    }

    await this.ensureDir(path.join(this.baseDir, threadId));
    const content = await fs.readFile(path.join(this.baseDir, threadId, latest), "utf-8");
    return JSON.parse(content);
  }

  /**
   * Write the thread content
   * @param resource The thread URI
   * @param thread The thread content
   */
  async writeThread(resource: string, thread: Thread): Promise<Stat | null> {
    const uri = new URI(resource);
    const threadId = md5(uri.toString());
    thread.id = threadId;
    if (!this.baseDir) {
      return null;
    }
    const dir = path.join(this.baseDir, threadId);
    await this.ensureDir(dir);
    const file = path.join(dir, uuidv7() + ".json");
    await fs.writeFile(file, JSON.stringify(thread, null, 2));
    return {
      name: threadId,
      type: FileType.File,
      size: 0,
      mtime: Date.now()
    };
  }

  private async getLatestSnapshotId(threadId: string): Promise<string | null> {
    if (!this.baseDir) {
      return null;
    }

    console.info("baseDir", this.baseDir);

    const dir = path.join(this.baseDir, threadId);
    await this.ensureDir(dir);
    const files = await fs.readdir(dir);
    if (files.length === 0) {
      return null;
    }
    return files.sort().pop() ?? null;
  }

  private async ensureDir(path: string) {
    try {
      await fs.stat(path);
    } catch {
      await fs.mkdir(path, { recursive: true });
    }
  }
}

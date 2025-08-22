import type { Thread } from "../../threading/common";
import type { Stat } from "./files";

export interface RemoteFileSystemServer {
  /**
   * Read the directory content
   * @param resource The directory URI
   */
  readdir(resource: string): Promise<Stat[]>;

  /**
   * Read the thread content
   * @param resource The thread URI
   */
  readThread(resource: string): Promise<Thread | null>;

  /**
   * Write the thread content
   * @param resource The thread URI
   * @param thread The thread content
   */
  writeThread(resource: string, thread: Thread): Promise<Stat>;

  /**
   * Read the file content
   * @param resource The file URI
   */
  readFile(resource: string): Promise<string | ArrayBuffer>;

  /**
   * Copy a file
   * @param resource The source file URI
   * @param target The target file URI
   */
  copyFile(resource: string, target: string): Promise<Stat>;

  /**
   * Write the file content
   * @param path The file URI
   * @param content The file content
   */
  writeFile(resource: string, content: string | ArrayBuffer): Promise<Stat>;

  /**
   * Create a file
   * @param resource The file URI
   */
  createFile(resource: string): Promise<Stat>;

  /**
   * Create a directory
   * @param resource The directory URI
   */
  mkdir(resource: string): Promise<Stat>;

  /**
   * Delete a file or directory
   * @param resource URI
   */
  rm(resource: string): Promise<boolean>;

  /**
   * Rename or move a file/directory
   * @param resource The original URI
   * @param target The new URI
   */
  rename(resource: string, target: string): Promise<Stat>;

  /**
   * Get the file/directory information
   * @param resource URI
   */
  stat(resource: string): Promise<Stat>;
}

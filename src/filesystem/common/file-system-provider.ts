import type { Stat } from "./files";
import type { URI } from "./URI";

export interface FileSystemProvider {
  readdir(resource: URI): Promise<Stat[]>;
  readFile(resource: URI): Promise<string | ArrayBuffer>;
  writeFile(resource: URI, content: string | ArrayBuffer): Promise<Stat>;
  copyFile(resource: URI, target: URI): Promise<Stat>;
  createFile(resource: URI): Promise<Stat>;
  mkdir(resource: URI): Promise<Stat>;
  rm(resource: URI): Promise<boolean>;
  rename(resource: URI, target: URI): Promise<Stat>;
  stat(resource: URI): Promise<Stat>;
  exists(resource: URI): Promise<boolean>;
}

import { type URI } from "./URI";

export enum FileType {
  File = "file",
  Directory = "directory",
}

export interface Stat {
  name: string;
  type: FileType;
  size: number;
  mtime: number; // The modification time, timestamp
}

export interface FileStat extends Stat {
  resource: URI;
  isFile: boolean;
  isDirectory: boolean;
  children?: FileStat[];
}

export const Files = {
  fromStat(resource: URI, stat: Stat): FileStat {
    return {
      resource,
      name: resource.path.base,
      mtime: stat.mtime,
      size: stat.size,
      type: stat.type,
      isFile: stat.type === FileType.File,
      isDirectory: stat.type === FileType.Directory,
    };
  },

  resolve(file: FileStat, name: string): URI {
    return file.resource.resolve(name);
  },

  equals(
    a: FileStat | null | undefined,
    b: FileStat | null | undefined,
  ): boolean {
    if (!a || !b) {
      return false;
    }
    return a.resource.isEqual(b.resource);
  },
};

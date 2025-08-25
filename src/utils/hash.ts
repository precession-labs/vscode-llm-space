import { createHash } from "node:crypto";

export function createMD5(str: string) {
  return createHash("md5").update(str).digest("hex");
}

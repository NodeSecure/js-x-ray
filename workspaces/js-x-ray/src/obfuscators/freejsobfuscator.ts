// Import Third-party Dependencies
import { Utils } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import {
  type ObfuscatedIdentifier
} from "../Deobfuscator.js";

export function verify(
  identifiers: ObfuscatedIdentifier[],
  prefix: Record<string, number>
) {
  const pValue = Object.keys(prefix).pop()!;
  const regexStr = `^${Utils.escapeRegExp(pValue)}[a-zA-Z]{1,2}[0-9]{0,2}$`;

  return identifiers.every(({ name }) => new RegExp(regexStr).test(name));
}

// Import Third-party Dependencies
import { Utils } from "@nodesecure/sec-literal";

export function verify(identifiers, prefix) {
  const pValue = Object.keys(prefix).pop();
  const regexStr = `^${Utils.escapeRegExp(pValue)}[a-zA-Z]{1,2}[0-9]{0,2}$`;

  return identifiers.every(({ name }) => new RegExp(regexStr).test(name));
}

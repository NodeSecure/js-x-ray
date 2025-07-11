// CONSTANTS
const kNodeModulePrefix = "node:";

export function stripNodePrefix(value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  return value.startsWith(kNodeModulePrefix) ?
    value.slice(kNodeModulePrefix.length) :
    value;
}

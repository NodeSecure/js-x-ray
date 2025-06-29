// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { rootLocation } from "./rootLocation.js";

export type SourceArrayLocation = [[number, number], [number, number]];

export function toArrayLocation(
  location: ESTree.SourceLocation = rootLocation()
): SourceArrayLocation {
  const { start, end = start } = location;

  return [
    [start.line || 0, start.column || 0],
    [end.line || 0, end.column || 0]
  ];
}

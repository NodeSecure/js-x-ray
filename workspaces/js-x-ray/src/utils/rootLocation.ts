// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export function rootLocation(): ESTree.SourceLocation {
  return {
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 }
  };
}

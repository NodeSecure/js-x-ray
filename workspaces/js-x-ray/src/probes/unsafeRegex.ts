// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import safeRegex from "safe-regex";

// Import Internal Dependencies
import type { SourceFile } from "../SourceFile.ts";

/**
 * @description
 * Report an unsafe-regex warning when the given pattern is vulnerable to ReDoS.
 * We use the safe-regex package to detect whether or not a regex is safe!
 */
export function reportUnsafeRegex(
  sourceFile: SourceFile,
  pattern: string,
  location: ESTree.SourceLocation | null | undefined
): void {
  if (safeRegex(pattern)) {
    return;
  }

  sourceFile.addWarning("unsafe-regex", { value: pattern, location });
}

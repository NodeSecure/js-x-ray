// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import safeRegex from "safe-regex";

// Import Internal Dependencies
import type { SourceFile } from "../SourceFile.ts";
import { generateWarning } from "../warnings.ts";

export function reportUnsafeRegex(
  sourceFile: SourceFile,
  pattern: string,
  location: ESTree.SourceLocation | null | undefined
): void {
  if (safeRegex(pattern)) {
    return;
  }

  sourceFile.warnings.push(
    generateWarning("unsafe-regex", { value: pattern, location })
  );
}

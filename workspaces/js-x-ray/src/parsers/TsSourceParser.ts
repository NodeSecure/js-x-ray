// Import Third-party Dependencies
import {
  parse,
  TSESTree,
  type TSESTreeOptions
} from "@typescript-eslint/typescript-estree";

// CONSTANTS
const kTypeScriptParsingOptions: TSESTreeOptions = {
  jsDocParsingMode: "none",
  jsx: true,
  loc: true,
  range: false
};

export type { TSESTreeOptions };

export class TsSourceParser {
  static FileExtensions = new Set([
    ".ts",
    ".mts",
    ".cts",
    ".tsx"
  ]);

  parse(
    source: string,
    options: TSESTreeOptions = {}
  ): TSESTree.Program["body"] {
    const { body } = parse(source, {
      ...kTypeScriptParsingOptions,
      ...options
    });

    return body;
  }
}

// Import Third-party Dependencies
import {
  parse,
  type TSESTreeOptions
} from "@typescript-eslint/typescript-estree";
import {
  type ESTree
} from "meriyah";

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
  ): ESTree.Statement[] {
    const { body } = parse(source, {
      ...kTypeScriptParsingOptions,
      ...options
    });

    /**
     * Not pretty but the types are not compatible and we know
     * that the body is compatible with ESTree.Statement[]
     * since the parser is designed to be compatible with ESTree.
     */
    return body as unknown as ESTree.Statement[];
  }
}

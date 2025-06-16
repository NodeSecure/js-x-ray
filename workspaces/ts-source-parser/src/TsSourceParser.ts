// Import Third-party Dependencies
import { parse, TSESTree } from "@typescript-eslint/typescript-estree";

type ParseOptions = Parameters<typeof parse>[1];

// CONSTANTS
const TYPESCRIPT_PARSING_OPTIONS: ParseOptions = {
  jsDocParsingMode: "none",
  jsx: true,
  loc: true,
  range: false
};

export class TsSourceParser {
  /**
   * @param {string} source
   * @param {object} options
   */
  parse(source: string, options: ParseOptions = {}): TSESTree.Program['body'] {
    const { body } = parse(source, {
      ...TYPESCRIPT_PARSING_OPTIONS,
      ...options
    });

    return body;
  }
}

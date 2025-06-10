// Import Third-party Dependencies
import { parse } from "@typescript-eslint/typescript-estree";

// CONSTANTS
const kTypeScriptParsingOptions = {
  jsDocParsingMode: "none",
  jsx: true,
  loc: true,
  range: false
};

export class TsSourceParser {
  /**
   * @param {object} options
   */
  parse(source, options = {}) {
    const { body } = parse(source, {
      ...kTypeScriptParsingOptions,
      ...options
    });

    return body;
  }
}


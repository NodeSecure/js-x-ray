// Import Third-party Dependencies
import { parse } from "@typescript-eslint/typescript-estree";

// Import Internal Dependencies

// CONSTANTS
export const tsParsingOptions = {
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
      ...tsParsingOptions,
      ...options
    });

    return body;
  }
}


// Import Third-party Dependencies
import * as meriyah from "meriyah";

// Import Internal Dependencies
import { SourceParser } from "./SourceParser.js";

// CONSTANTS
const kParsingOptions = {
  next: true,
  loc: true,
  raw: true,
  jsx: true
};

export class JsSourceParser extends SourceParser {
  /**
   * @param {object} options
   * @param {boolean} options.isEcmaScriptModule
   */
  parseScript(options = {}) {
    const {
      isEcmaScriptModule
    } = options;

    try {
      const { body } = meriyah.parseScript(
        this.source,
        {
          ...kParsingOptions,
          module: isEcmaScriptModule,
          globalReturn: !isEcmaScriptModule
        }
      );

      return body;
    }
    catch (error) {
      const isIllegalReturn = error.description.includes("Illegal return statement");

      if (error.name === "SyntaxError" && (
        error.description.includes("The import keyword") ||
        error.description.includes("The export keyword") ||
        isIllegalReturn
      )) {
        const { body } = meriyah.parseScript(
          this.source,
          {
            ...kParsingOptions,
            module: true,
            globalReturn: isIllegalReturn
          }
        );

        return body;
      }

      throw error;
    }
  }
}


// Import Third-party Dependencies
import * as meriyah from "meriyah";

// CONSTANTS
const kParsingOptions = {
  next: true,
  loc: true,
  raw: true,
  jsx: true
};

export class JsSourceParser {
  /**
   * @param {object} options
   * @param {boolean} options.isEcmaScriptModule
   */
  parse(source, options = {}) {
    const {
      isEcmaScriptModule
    } = options;

    try {
      return meriyah.parseScript(
        source,
        {
          ...kParsingOptions,
          module: isEcmaScriptModule,
          globalReturn: !isEcmaScriptModule
        }
      );
    }
    catch (error) {
      const isIllegalReturn = error.description.includes("Illegal return statement");

      if (error.name === "SyntaxError" && (
        error.description.includes("The import keyword") ||
        error.description.includes("The export keyword") ||
        isIllegalReturn
      )) {
        return meriyah.parseScript(
          source,
          {
            ...kParsingOptions,
            module: true,
            globalReturn: isIllegalReturn
          }
        );
      }

      throw error;
    }
  }
}

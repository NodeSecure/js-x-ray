// Import Third-party Dependencies
import * as meriyah from "meriyah";

// CONSTANTS
const kParsingOptions = {
  next: true,
  loc: true,
  raw: true,
  jsx: true
};

export class SourceParser {
  /**
   * @param {!string} source
   * @param {object} options
   * @param {boolean} [options.removeHTMLComments=false]
   */
  constructor(source, options = {}) {
    if (typeof source !== "string") {
      throw new TypeError("source must be a string");
    }
    const { removeHTMLComments = false } = options;

    this.raw = source;

    /**
     * if the file start with a shebang then we remove it because meriyah.parseScript fail to parse it.
     * @example
     * #!/usr/bin/env node
     */
    const rawNoShebang = source.charAt(0) === "#" ?
      source.slice(source.indexOf("\n") + 1) : source;

    this.source = removeHTMLComments ?
      this.#removeHTMLComment(rawNoShebang) : rawNoShebang;
  }

  /**
   * @param {!string} str
   * @returns {string}
   */
  #removeHTMLComment(str) {
    return str.replaceAll(/<!--[\s\S]*?(?:-->)/g, "");
  }

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


// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { walk } from "estree-walker";
import isMinified from "is-minified-code";

// Import Internal Dependencies
import { SourceFile } from "./SourceFile.js";
import { isOneLineExpressionExport } from "./utils/index.js";

export class AstAnalyser {
  /**
   * @constructor
   * @param { Parser } parser
   */
  constructor(parser) {
    this.parser = parser;
  }

  analyse(str, options = Object.create(null)) {
    const {
      isMinified = false,
      module = true,
      removeHTMLComments = false
    } = options;

    const { body } = this.parser.parse(this.prepareSource(str, { removeHTMLComments }), {
      isEcmaScriptModule: Boolean(module)
    });

    const source = new SourceFile(str);

    // we walk each AST Nodes, this is a purely synchronous I/O
    walk(body, {
      enter(node) {
      // Skip the root of the AST.
        if (Array.isArray(node)) {
          return;
        }

        const action = source.walk(node);
        if (action === "skip") {
          this.skip();
        }
      }
    });

    return {
      ...source.getResult(isMinified),
      dependencies: source.dependencies,
      isOneLineRequire: isOneLineExpressionExport(body)
    };
  }

  async analyseFile(
    pathToFile,
    options = {}
  ) {
    try {
      const {
        packageName = null,
        module = true,
        removeHTMLComments = false
      } = options;

      const str = await fs.readFile(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinified(str);
      const data = this.analyse(str, {
        isMinified: isMin,
        module: path.extname(filePathString) === ".mjs" ? true : module,
        removeHTMLComments
      });

      if (packageName !== null) {
        data.dependencies.delete(packageName);
      }

      return {
        ok: true,
        dependencies: data.dependencies,
        warnings: data.warnings,
        isMinified: !data.isOneLineRequire && isMin
      };
    }
    catch (error) {
      return {
        ok: false,
        warnings: [
          { kind: "parsing-error", value: error.message, location: [[0, 0], [0, 0]] }
        ]
      };
    }
  }

  /**
   * @param {!string} source
   * @param {object} options
   * @param {boolean} [options.removeHTMLComments=false]
   */
  prepareSource(source, options = {}) {
    if (typeof source !== "string") {
      throw new TypeError("source must be a string");
    }
    const { removeHTMLComments = false } = options;

    /**
     * if the file start with a shebang then we remove it because meriyah.parseScript fail to parse it.
     * @example
     * #!/usr/bin/env node
     */
    const rawNoShebang = source.charAt(0) === "#" ?
      source.slice(source.indexOf("\n") + 1) : source;

    return removeHTMLComments ?
      this.#removeHTMLComment(rawNoShebang) : rawNoShebang;
  }

  /**
   * @param {!string} str
   * @returns {string}
   */
  #removeHTMLComment(str) {
    return str.replaceAll(/<!--[\s\S]*?(?:-->)/g, "");
  }
}

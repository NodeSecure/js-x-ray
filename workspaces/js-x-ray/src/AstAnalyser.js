// Import Node.js Dependencies
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

// Import Third-party Dependencies
import { walk } from "estree-walker";
import isMinified from "is-minified-code";

// Import Internal Dependencies
import { SourceFile } from "./SourceFile.js";
import { isOneLineExpressionExport } from "./utils/index.js";
import { JsSourceParser } from "./JsSourceParser.js";

export class AstAnalyser {
  /**
   * @constructor
   * @param {object} [options={}]
   * @param {SourceParser} [options.customParser]
   * @param {Array<object>} [options.customProbes]
   * @param {boolean} [options.skipDefaultProbes=false]
   * @param {boolean | Iterable<string>} [options.optionalWarnings=false]
   */
  constructor(options = {}) {
    this.parser = options.customParser ?? new JsSourceParser();
    this.probesOptions = {
      customProbes: options.customProbes ?? [],
      skipDefaultProbes: options.skipDefaultProbes ?? false,
      optionalWarnings: options.optionalWarnings ?? false
    };
  }

  analyse(str, options = Object.create(null)) {
    const {
      isMinified = false,
      module = true,
      removeHTMLComments = false,
      initialize,
      finalize
    } = options;

    const body = this.parser.parse(this.prepareSource(str, { removeHTMLComments }), {
      isEcmaScriptModule: Boolean(module)
    });
    const source = new SourceFile(str, this.probesOptions);

    // TODO: this check should be factorized in a way that we reuse it
    // on analyze and anlyseFile
    if (initialize) {
      if (typeof initialize !== "function") {
        throw new TypeError("options.initialize must be a function");
      }
      initialize(source);
    }

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

    // TODO: this check should be factorized in a way that we reuse it
    // on analyze and anlyseFile
    if (finalize) {
      if (typeof finalize !== "function") {
        throw new TypeError("options.finalize must be a function");
      }
      finalize(source);
    }

    // Add oneline-require flag if this is a one-line require expression
    if (isOneLineExpressionExport(body)) {
      source.flags.add("oneline-require");
    }

    return {
      ...source.getResult(isMinified),
      dependencies: source.dependencies,
      flags: source.flags
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
        removeHTMLComments = false,
        initialize,
        finalize
      } = options;

      const str = await fs.readFile(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinified(str);
      const data = this.analyse(str, {
        isMinified: isMin,
        module: path.extname(filePathString) === ".mjs" ? true : module,
        removeHTMLComments,
        initialize,
        finalize
      });

      if (packageName !== null) {
        data.dependencies.delete(packageName);
      }

      // Add is-minified flag if the file is minified and not a one-line require
      if (!data.flags.has("oneline-require") && isMin) {
        data.flags.add("is-minified");
      }

      return {
        ok: true,
        dependencies: data.dependencies,
        warnings: data.warnings,
        flags: data.flags
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

  analyseFileSync(
    pathToFile,
    options = {}
  ) {
    try {
      const {
        packageName = null,
        module = true,
        removeHTMLComments = false,
        initialize,
        finalize
      } = options;

      const str = fsSync.readFileSync(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinified(str);
      const data = this.analyse(str, {
        isMinified: isMin,
        module: path.extname(filePathString) === ".mjs" ? true : module,
        removeHTMLComments,
        initialize,
        finalize
      });

      if (packageName !== null) {
        data.dependencies.delete(packageName);
      }

      // Add is-minified flag if the file is minified and not a one-line require
      if (!data.flags.has("oneline-require") && isMin) {
        data.flags.add("is-minified");
      }

      return {
        ok: true,
        dependencies: data.dependencies,
        warnings: data.warnings,
        flags: data.flags
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
    const rawNoShebang = source.startsWith("#") ?
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

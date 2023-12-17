// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { walk } from "estree-walker";
import * as meriyah from "meriyah";
import isMinified from "is-minified-code";

// Import Internal Dependencies
import { SourceFile } from "./src/SourceFile.js";
import { warnings } from "./src/warnings.js";
import * as utils from "./src/utils.js";

// CONSTANTS
const kMeriyahDefaultOptions = {
  next: true,
  loc: true,
  raw: true,
  jsx: true
};

export function runASTAnalysis(
  str,
  options = Object.create(null)
) {
  const {
    module = true,
    isMinified = false,
    removeHTMLComments = false
  } = options;

  // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
  // Example: #!/usr/bin/env node
  const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
  const body = parseScriptExtended(strToAnalyze, {
    isEcmaScriptModule: Boolean(module),
    removeHTMLComments
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
    isOneLineRequire: body.length <= 1 && source.dependencies.size <= 1
  };
}

export async function runASTAnalysisOnFile(
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
    const data = runASTAnalysis(str, {
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

function parseScriptExtended(strToAnalyze, options = {}) {
  const { isEcmaScriptModule, removeHTMLComments } = options;

  /**
   * @see https://github.com/NodeSecure/js-x-ray/issues/109
   */
  const cleanedStrToAnalyze = removeHTMLComments ?
    utils.removeHTMLComment(strToAnalyze) : strToAnalyze;

  try {
    const { body } = meriyah.parseScript(
      cleanedStrToAnalyze,
      {
        ...kMeriyahDefaultOptions,
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
        cleanedStrToAnalyze,
        {
          ...kMeriyahDefaultOptions,
          module: true,
          globalReturn: isIllegalReturn
        }
      );

      return body;
    }

    throw error;
  }
}

export { warnings };

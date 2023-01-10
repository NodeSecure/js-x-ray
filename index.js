// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { walk } from "estree-walker";
import * as meriyah from "meriyah";
import isMinified from "is-minified-code";

// Import Internal Dependencies
import Analysis from "./src/Analysis.js";
import { warnings } from "./src/warnings.js";

// CONSTANTS
const kMeriyahDefaultOptions = {
  next: true,
  loc: true,
  raw: true
};

export function runASTAnalysis(str, options = Object.create(null)) {
  const { module = true, isMinified = false } = options;

  // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
  // Example: #!/usr/bin/env node
  const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
  const isEcmaScriptModule = Boolean(module);
  const body = parseScriptExtended(strToAnalyze, isEcmaScriptModule);

  const sastAnalysis = new Analysis();
  sastAnalysis.analyzeSourceString(str);

  // we walk each AST Nodes, this is a purely synchronous I/O
  walk(body, {
    enter(node) {
      // Skip the root of the AST.
      if (Array.isArray(node)) {
        return;
      }

      const action = sastAnalysis.walk(node);
      if (action === "skip") {
        this.skip();
      }
    }
  });

  const dependencies = sastAnalysis.dependencies;
  const { idsLengthAvg, stringScore, warnings } = sastAnalysis.getResult(isMinified);
  const isOneLineRequire = body.length <= 1 && dependencies.size <= 1;

  return {
    dependencies, warnings, idsLengthAvg, stringScore, isOneLineRequire
  };
}

export async function runASTAnalysisOnFile(pathToFile, options = {}) {
  try {
    const { packageName = null, module = true } = options;
    const str = await fs.readFile(pathToFile, "utf-8");
    const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

    const isMin = filePathString.includes(".min") || isMinified(str);
    const data = runASTAnalysis(str, {
      isMinified: isMin,
      module: path.extname(filePathString) === ".mjs" ? true : module
    });
    if (packageName !== null) {
      data.dependencies.removeByName(packageName);
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

function parseScriptExtended(strToAnalyze, isEcmaScriptModule) {
  try {
    const { body } = meriyah.parseScript(strToAnalyze, {
      ...kMeriyahDefaultOptions,
      module: isEcmaScriptModule,
      globalReturn: !isEcmaScriptModule
    });

    return body;
  }
  catch (error) {
    if (error.name === "SyntaxError" && error.description.includes("The import keyword")) {
      const { body } = meriyah.parseScript(strToAnalyze, {
        ...kMeriyahDefaultOptions, module: true
      });

      return body;
    }

    throw error;
  }
}

export { warnings };

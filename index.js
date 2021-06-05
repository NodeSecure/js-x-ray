// Import Third-party Dependencies
import { walk } from "estree-walker";
import * as meriyah from "meriyah";

// Import Internal Dependencies
import Analysis from "./src/Analysis.js";

export function runASTAnalysis(str, options = Object.create(null)) {
  const { module = true, isMinified = false } = options;

  // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
  // Example: #!/usr/bin/env node
  const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
  const { body } = meriyah.parseScript(strToAnalyze, {
    next: true, loc: true, raw: true, module: Boolean(module)
  });

  const sastAnalysis = new Analysis();

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

export const CONSTANTS = {
  Warnings: Object.freeze({
    parsingError: "ast-error",
    unsafeImport: "unsafe-import",
    unsafeRegex: "unsafe-regex",
    unsafeStmt: "unsafe-stmt",
    unsafeAssign: "unsafe-assign",
    encodedLiteral: "encoded-literal",
    shortIdentifiers: "short-identifiers",
    suspiciousLiteral: "suspicious-literal",
    obfuscatedCode: "obfuscated-code"
  })
};

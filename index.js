// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { walk } from "estree-walker";
import * as meriyah from "meriyah";
import isMinified from "is-minified-code";

// Import Internal Dependencies
import Analysis from "./src/Analysis.js";

export function runASTAnalysis(str, options = Object.create(null)) {
  const { module = true, isMinified = false } = options;

  // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
  // Example: #!/usr/bin/env node
  const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
  const isEcmaScriptModule = Boolean(module);
  const { body } = meriyah.parseScript(strToAnalyze, {
    next: true,
    loc: true,
    raw: true,
    module: isEcmaScriptModule,
    globalReturn: !isEcmaScriptModule
  });

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

    const isMin = pathToFile.includes(".min") || isMinified(str);
    const data = runASTAnalysis(str, {
      isMinified: isMin,
      module: path.extname(pathToFile) === ".mjs" ? true : module
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

export const warnings = Object.freeze({
  parsingError: {
    code: "ast-error",
    i18n: "sast_warnings.ast_error",
    severity: "Information"
  },
  unsafeImport: {
    code: "unsafe-import",
    i18n: "sast_warnings.unsafe_import",
    severity: "Warning"
  },
  unsafeRegex: {
    code: "unsafe-regex",
    i18n: "sast_warnings.unsafe_regex",
    severity: "Warning"
  },
  unsafeStmt: {
    code: "unsafe-stmt",
    i18n: "sast_warnings.unsafe_stmt",
    severity: "Warning"
  },
  unsafeAssign: {
    code: "unsafe-assign",
    i18n: "sast_warnings.unsafe_assign",
    severity: "Warning"
  },
  encodedLiteral: {
    code: "encoded-literal",
    i18n: "sast_warnings.encoded_literal",
    severity: "Information"
  },
  shortIdentifiers: {
    code: "short-identifiers",
    i18n: "sast_warnings.short_identifiers",
    severity: "Warning"
  },
  suspiciousLiteral: {
    code: "suspicious-literal",
    i18n: "sast_warnings.suspicious_literal",
    severity: "Warning"
  },
  obfuscatedCode: {
    code: "obfuscated-code",
    i18n: "sast_warnings.obfuscated_code",
    severity: "Critical"
  }
});



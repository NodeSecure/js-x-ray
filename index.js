// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { walk } from "estree-walker";
import isMinified from "is-minified-code";

// Import Internal Dependencies
import { SourceFile } from "./src/SourceFile.js";
import { SourceParser } from "./src/SourceParser.js";
import { warnings } from "./src/warnings.js";
import { isOneLineExpressionExport } from "./src/utils.js";

export function runASTAnalysis(
  str,
  options = Object.create(null)
) {
  const {
    module = true,
    isMinified = false,
    removeHTMLComments = false
  } = options;

  const parser = new SourceParser(str, { removeHTMLComments });
  const body = parser.parseScript({
    isEcmaScriptModule: Boolean(module)
  });

  const source = new SourceFile(parser.raw);

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
    isOneLineRequire: body.length <= 1 && (source.dependencies.size <= 1 || isOneLineExpressionExport(body))
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

export { warnings };

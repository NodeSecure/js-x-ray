// Import Internal Dependencies
import { warnings } from "./src/warnings.js";
import { JsSourceParser } from "./src/JsSourceParser.js";
import { AstAnalyser } from "./src/AstAnalyser.js";
import { EntryFilesAnalyser } from "./src/EntryFilesAnalyser.js";

/**
 * @deprecated
 */
function runASTAnalysis(
  str,
  options = Object.create(null)
) {
  process.emitWarning(
    "The runASTAnalysis API is deprecated and will be removed in v8. Please use the AstAnalyser class instead.",
    {
      code: "DeprecationWarning",
      detail: "The runASTAnalysis API is deprecated and will be removed in v8. Please use the AstAnalyser class instead."
    }
  );

  const {
    customParser = new JsSourceParser(),
    customProbes = [],
    skipDefaultProbes = false,
    ...opts
  } = options;

  const analyser = new AstAnalyser({
    customParser,
    customProbes,
    skipDefaultProbes
  });

  return analyser.analyse(str, opts);
}

/**
 * @deprecated
 */
async function runASTAnalysisOnFile(
  pathToFile,
  options = {}
) {
  process.emitWarning(
    "The runASTAnalysisOnFile API is deprecated and will be removed in v8. Please use the AstAnalyser class instead.",
    {
      code: "DeprecationWarning",
      detail: "The runASTAnalysisOnFile API is deprecated and will be removed in v8. Please use the AstAnalyser class instead."
    }
  );

  const {
    customProbes = [],
    customParser = new JsSourceParser(),
    skipDefaultProbes = false,
    ...opts
  } = options;

  const analyser = new AstAnalyser({
    customParser,
    customProbes,
    skipDefaultProbes
  });

  return analyser.analyseFile(pathToFile, opts);
}

export {
  warnings,
  AstAnalyser,
  EntryFilesAnalyser,
  JsSourceParser,
  runASTAnalysis,
  runASTAnalysisOnFile
};

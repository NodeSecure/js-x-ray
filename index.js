// Import Internal Dependencies
import { warnings } from "./src/warnings.js";
import { JsSourceParser } from "./src/JsSourceParser.js";
import { AstAnalyser } from "./src/AstAnalyser.js";

function runASTAnalysis(
  str,
  options = Object.create(null)
) {
  const {
    customParser = new JsSourceParser(),
    customProbe = [],
    isReplacing = false,
    ...opts
  } = options;

  const analyser = new AstAnalyser(options);

  return analyser.analyse(str, opts);
}

async function runASTAnalysisOnFile(
  pathToFile,
  options = {}
) {
  const {
    customParser = new JsSourceParser(),
    customProbe = [],
    isReplacing = false,
    ...opts
  } = options;

  const analyser = new AstAnalyser(options);

  return analyser.analyseFile(pathToFile, opts);
}

export {
  warnings,
  AstAnalyser,
  runASTAnalysis,
  runASTAnalysisOnFile
};

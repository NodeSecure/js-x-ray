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
    astOptions = { isReplacing: false, customProbe: [] },
    ...opts
  } = options;

  const analyser = new AstAnalyser(customParser, options.astOptions);

  return analyser.analyse(str, opts);
}

async function runASTAnalysisOnFile(
  pathToFile,
  options = {}
) {
  const {
    customParser = new JsSourceParser(),
    astOptions = { isReplacing: false, customProbe: [] },
    ...opts
  } = options;

  const analyser = new AstAnalyser(customParser, options.astOptions);

  return analyser.analyseFile(pathToFile, opts);
}

export {
  warnings,
  AstAnalyser,
  runASTAnalysis,
  runASTAnalysisOnFile
};

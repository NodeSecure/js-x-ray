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

async function runASTAnalysisOnFile(
  pathToFile,
  options = {}
) {
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

  return analyser.analyseFile(pathToFile, opts);
}

export {
  warnings,
  AstAnalyser,
  runASTAnalysis,
  runASTAnalysisOnFile
};

import * as meriyah from "meriyah";
import Analysis from "../../src/Analysis.js";
import { walk } from "estree-walker";

export function getWarningKind(warnings) {
  return warnings.slice().map((warn) => warn.kind).sort();
}

export function parseScript(str) {
  const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;

  return meriyah.parseScript(strToAnalyze, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
  });
}

export function getSastAnalysis(strSource, body) {
  const sastAnalysis = new Analysis();
  sastAnalysis.analyzeSourceString(strSource);

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

  return sastAnalysis;
}

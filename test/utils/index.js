import * as meriyah from "meriyah";
import Analysis from "../../src/Analysis.js";
import { walk } from "estree-walker";
import { kSymSkip } from "../../src/probes/index.js";

export function getWarningKind(warnings) {
  return warnings.slice().map((warn) => warn.kind).sort();
}

export function parseScript(str) {
  return meriyah.parseScript(str, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
  });
}

function runOnProbes(node, analysis, probe) {
  const [isMatching, data = null] = probe.validateNode(node, analysis);

  if (isMatching) {
    const result = probe.main(node, { analysis, data });

    if (result === kSymSkip) {
      return "skip";
    }
  }

  return null;
}

export function getSastAnalysis(strSource, body, probe) {
  const sastAnalysis = new Analysis();
  sastAnalysis.analyzeSourceString(strSource);

  walk(body, {
    enter(node) {
      // Skip the root of the AST.
      if (Array.isArray(node)) {
        return;
      }


      const action = runOnProbes(node, sastAnalysis, probe);

      if (action === "skip") {
        this.skip();
      }
    }
  });

  return sastAnalysis;
}

export function getWarningOnAnalysisResult(analysis, warning) {
  return analysis.warnings.find((item) => item.kind === warning);
}

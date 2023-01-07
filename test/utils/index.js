import * as meriyah from "meriyah";
import Analysis from "../../src/Analysis.js";
import { walk } from "estree-walker";

export function getWarningKind(warnings) {
  return warnings.slice().map((warn) => warn.kind).sort();
}

export function mockedFunction() {
  return {
    called: 0,
    args: [],
    haveBeenCalledTimes(count = 0) {
      return this.called === count;
    },
    haveBeenCalledWith(value) {
      return this.args.includes(value);
    },
    callback(...args) {
      this.args.push(...args);
      this.called++;
    }
  };
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

    if (result === Symbol.for("skipWalk")) {
      return "skip";
    }
  }

  return null;
}

export function getSastAnalysis(strSource, probe) {
  return {
    analysis: new Analysis(),
    getWarning(warning) {
      return this.analysis.warnings.find(
        (item) => item.kind === warning
      );
    },
    warnings() {
      return this.analysis.warnings;
    },
    dependencies() {
      return this.analysis.dependencies.dependencies;
    },
    execute(body) {
      const self = this;
      this.analysis.analyzeSourceString(strSource);

      walk(body, {
        enter(node) {
          // Skip the root of the AST.
          if (Array.isArray(node)) {
            return;
          }

          self.analysis.tracer.walk(node);

          const action = runOnProbes(node, self.analysis, probe);
          if (action === "skip") {
            this.skip();
          }
        }
      });

      return this;
    }
  };
}

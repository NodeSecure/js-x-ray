// Import Third-party Dependencies
import * as meriyah from "meriyah";
import { walk } from "estree-walker";

// Import Internal Dependencies
import { SourceFile } from "../../src/SourceFile.js";
import { ProbeRunner } from "../../src/ProbeRunner.js";

export function getWarningKind(warnings) {
  return warnings.slice().map((warn) => warn.kind).sort();
}

export function mockedFunction() {
  return {
    called: 0,
    args: [],
    at(position) {
      return this.args[position];
    },
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

export function getSastAnalysis(
  sourceCodeString,
  probe
) {
  return {
    analysis: new SourceFile(sourceCodeString),
    getWarning(warning) {
      return this.analysis.warnings.find(
        (item) => item.kind === warning
      );
    },
    warnings() {
      return this.analysis.warnings;
    },
    dependencies() {
      return this.analysis.dependencies;
    },
    execute(body) {
      const probeRunner = new ProbeRunner(this.analysis, [probe]);
      const self = this;

      walk(body, {
        enter(node) {
          // Skip the root of the AST.
          if (Array.isArray(node)) {
            return;
          }

          self.analysis.tracer.walk(node);

          const action = probeRunner.walk(node);
          if (action === "skip") {
            this.skip();
          }
        }
      });

      return this;
    }
  };
}

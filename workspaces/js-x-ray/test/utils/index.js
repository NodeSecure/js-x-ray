// Import Third-party Dependencies
import * as meriyah from "meriyah";
import { walk } from "estree-walker";

// Import Internal Dependencies
import { SourceFile } from "../../src/SourceFile.js";
import { ProbeRunner, ProbeSignals } from "../../src/ProbeRunner.js";

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

export function getSastAnalysis(
  sourceCodeString,
  probe
) {
  return {
    sourceFile: new SourceFile(sourceCodeString),
    getWarning(warning) {
      return this.sourceFile.warnings.find(
        (item) => item.kind === warning
      );
    },
    warnings() {
      return this.sourceFile.warnings;
    },
    dependencies() {
      return this.sourceFile.dependencies;
    },
    execute(body) {
      const probeRunner = new ProbeRunner(this.sourceFile, [probe]);
      const self = this;

      walk(body, {
        enter(node) {
          // Skip the root of the AST.
          if (Array.isArray(node)) {
            return;
          }

          self.sourceFile.tracer.walk(node);

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

export const customProbes = [
  {
    name: "customProbeUnsafeDanger",
    validateNode: (node, _sourceFile) => [node.type === "VariableDeclaration" && node.declarations[0].init.value === "danger"]
    ,
    main: (node, options) => {
      const { sourceFile, data: calleeName } = options;
      if (node.declarations[0].init.value === "danger") {
        sourceFile.addWarning("unsafe-danger", calleeName, node.loc);

        return ProbeSignals.Skip;
      }

      return null;
    }
  }
];

export const kIncriminedCodeSampleCustomProbe = "const danger = 'danger'; const stream = eval('require')('stream');";
export const kWarningUnsafeDanger = "unsafe-danger";
export const kWarningUnsafeImport = "unsafe-import";
export const kWarningUnsafeStmt = "unsafe-stmt";

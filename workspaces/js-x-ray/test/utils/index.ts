// Import Third-party Dependencies
import * as meriyah from "meriyah";
import { walk } from "estree-walker";

// Import Internal Dependencies
import {
  SourceFile,
  type Dependency,
  type Warning
} from "../../src/index.js";
import {
  ProbeRunner,
  type Probe
} from "../../src/ProbeRunner.js";

export function getWarningKind(
  warnings: Warning[]
): string[] {
  return warnings.slice().map((warn) => warn.kind).sort();
}

export function parseScript(
  str: string
) {
  return meriyah.parseScript(str, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
  });
}

export function getSastAnalysis(
  probe: Probe
) {
  return {
    sourceFile: new SourceFile(),
    getWarning(warning: string): Warning | undefined {
      return this.warnings().find(
        (item: Warning) => item.kind === warning
      );
    },
    warnings(): Warning[] {
      return this.sourceFile.warnings;
    },
    dependencies(): Map<string, Dependency> {
      return this.sourceFile.dependencies;
    },
    execute(body: any) {
      const probeRunner = new ProbeRunner(this.sourceFile, [probe]);
      const self = this;

      walk(body, {
        enter(node: any) {
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

export const customProbes: Probe[] = [
  {
    name: "customProbeUnsafeDanger",
    validateNode(node: any): [boolean, any?] {
      return [
        node.type === "VariableDeclaration" &&
        node.declarations[0].init.value === "danger"
      ];
    },
    main(node, ctx) {
      const { sourceFile, data: calleeName, signals } = ctx;
      if (node.declarations[0].init.value === "danger") {
        sourceFile.warnings.push({
          kind: "unsafe-danger",
          value: calleeName,
          location: node.loc,
          source: "JS-X-Ray Custom Probe",
          i18n: "sast_warnings.unsafe-danger",
          severity: "Warning"
        });

        return signals.Skip;
      }

      return null;
    }
  }
];

export const kIncriminedCodeSampleCustomProbe = "const danger = 'danger'; const stream = eval('require')('stream');";
export const kWarningUnsafeDanger = "unsafe-danger";
export const kWarningUnsafeImport = "unsafe-import";
export const kWarningUnsafeStmt = "unsafe-stmt";

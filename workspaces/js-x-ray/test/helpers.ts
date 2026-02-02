// Import Third-party Dependencies
import * as meriyah from "meriyah";

// Import Internal Dependencies
import {
  SourceFile,
  type Dependency,
  type Warning
} from "../src/index.ts";
import {
  ProbeRunner,
  type Probe
} from "../src/ProbeRunner.ts";
import { walk } from "../src/walker/index.ts";
import { CollectableSet } from "../src/CollectableSet.ts";
import { CollectableSetRegistry } from "../src/CollectableSetRegistry.ts";

export function getExpressionFromStatement(node: any) {
  return node.type === "ExpressionStatement" ? node.expression : null;
}

export function getExpressionFromStatementIf(
  node: any
) {
  return node.type === "ExpressionStatement" ? node.expression : node;
}

export function getWarningKind(
  warnings: Warning[]
): string[] {
  return warnings.slice().map((warn) => warn.kind).sort();
}

export function parseScript(
  str: string
) {
  const options = {
    next: true,
    loc: true,
    raw: true
  };

  try {
    return meriyah.parseModule(str, options);
  }
  catch {
    return meriyah.parseScript(str, options);
  }
}

type Options = {
  location?: string;
  collectables?: CollectableSet[];
  sensitivity?: "conservative" | "aggressive";
  metadata?: Record<string, unknown>;
};

export function getSastAnalysis(
  probe: Probe,
  options: Options = {}
) {
  const { location, collectables = [], metadata } = options;

  return {
    sourceFile: new SourceFile(location, metadata),
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
      if (options.sensitivity) {
        this.sourceFile.sensitivity = options.sensitivity;
      }

      const probeRunner = new ProbeRunner(this.sourceFile, new CollectableSetRegistry(collectables), [probe]);
      const self = this;

      walk(body, {
        enter(node: meriyah.ESTree.Node) {
          // Skip the root of the AST.
          if (Array.isArray(node)) {
            return;
          }

          for (const probeNode of self.sourceFile.walk(node)) {
            const action = probeRunner.walk(probeNode);
            if (action === "skip") {
              this.skip();
            }
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

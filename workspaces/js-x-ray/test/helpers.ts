// Import Third-party Dependencies
import * as meriyah from "meriyah";

// Import Internal Dependencies
import type { ESTreeLiteral } from "../src/estree/literal.ts";
import {
  DefaultCollectableSet,
  SourceFile,
  type Dependency,
  type Warning
} from "../src/index.ts";
import {
  ProbeRunner,
  type Probe
} from "../src/ProbeRunner.ts";
import { walk } from "../src/walker/index.ts";
import type { CollectableSet, Location } from "../src/CollectableSet.ts";

// @see https://github.com/estree/estree/blob/master/es5.md#literal
export function createLiteral(
  value: string,
  includeRaw = false
): ESTreeLiteral {
  const node: ESTreeLiteral = { type: "Literal", value };
  if (includeRaw) {
    node.raw = value;
  }

  return node;
}

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
  const { location, collectables = [new DefaultCollectableSet("dependency")], metadata } = options;

  return {
    sourceFile: new SourceFile(location, { metadata, collectables }),
    getWarning(warning: string): Warning | undefined {
      return this.warnings().find(
        (item: Warning) => item.kind === warning
      );
    },
    warnings(): Warning[] {
      return this.sourceFile.warnings;
    },
    dependencies(): Map<string, Dependency> {
      const dependencySet =
        collectables.find((collectable) => collectable.type === "dependency") as DefaultCollectableSet<Dependency> | undefined;

      if (!dependencySet) {
        return new Map();
      }

      return extractDependencies(dependencySet);
    },
    execute(body: any) {
      if (options.sensitivity) {
        this.sourceFile.sensitivity = options.sensitivity;
      }

      const probeRunner = new ProbeRunner(this.sourceFile, [probe]);
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

export function extractDependencies(dependencySet: DefaultCollectableSet<Dependency>) {
  const dependencies = new Map<string, Dependency>();
  for (const { value, locations } of dependencySet) {
    locations.forEach(({ metadata }: Location<Dependency>) => {
      dependencies.set(value, {
        unsafe: metadata?.unsafe ?? false,
        inTry: metadata?.inTry ?? false
      });
    });
  }

  return dependencies;
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

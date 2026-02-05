// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { VariableTracer } from "./VariableTracer.ts";
import type {
  Dependency,
  Sensitivity
} from "./AstAnalyser.ts";
import { InlinedRequire } from "./probes/isRequire/InlinedRequire.ts";
import { Deobfuscator } from "./Deobfuscator.ts";
import {
  rootLocation,
  toArrayLocation,
  isSvg,
  isStringBase64
} from "./utils/index.ts";
import {
  generateWarning,
  type Warning
} from "./warnings.ts";

// CONSTANTS
const kMaximumEncodedLiterals = 10;

export type SourceFlags =
  | "fetch"
  | "oneline-require"
  | "is-minified";

export class SourceFile {
  tracer = new VariableTracer().enableDefaultTracing();
  inTryStatement = false;
  dependencyAutoWarning = false;
  deobfuscator = new Deobfuscator();
  dependencies = new Map<string, Dependency>();
  encodedLiterals = new Map<string, string>();
  warnings: Warning[] = [];
  flags = new Set<SourceFlags>();
  path = new SourceFilePath();
  sensitivity?: Sensitivity;
  metadata?: Record<string, unknown>;

  constructor(sourceLocation?: string, metadata?: Record<string, unknown>) {
    this.path.use(sourceLocation);
    this.metadata = metadata;
  }

  addDependency(
    name: string,
    location?: ESTree.SourceLocation | null,
    unsafe: boolean = this.dependencyAutoWarning
  ) {
    if (typeof name !== "string" || name.trim() === "") {
      return;
    }

    const dependencyName = name.charAt(name.length - 1) === "/" ?
      name.slice(0, -1) : name;
    this.dependencies.set(dependencyName, {
      unsafe,
      inTry: this.inTryStatement,
      ...(location ? { location } : {})
    });

    if (this.dependencyAutoWarning) {
      this.warnings.push(
        generateWarning("unsafe-import", {
          value: dependencyName,
          location: location || void 0
        })
      );
    }
  }

  addEncodedLiteral(
    value: string,
    location: ESTree.SourceLocation | undefined | null
  ) {
    if (this.encodedLiterals.size > kMaximumEncodedLiterals) {
      return;
    }

    if (this.encodedLiterals.has(value)) {
      const index = this.encodedLiterals.get(value)!;
      this.warnings[index].location.push(toArrayLocation(location ?? rootLocation()));

      return;
    }

    this.warnings.push(generateWarning("encoded-literal", { value, location }));
    this.encodedLiterals.set(value, String(this.warnings.length - 1));
  }

  analyzeLiteral(
    node: ESTree.Literal,
    inArrayExpr = false
  ) {
    if (typeof node.value !== "string" || isSvg(node)) {
      return;
    }
    this.deobfuscator.analyzeString(node.value);

    const hasRawValue = "raw" in node;
    const hasHexadecimalSequence = hasRawValue ?
      /\\x[a-fA-F0-9]{2}/g.exec(node.raw!) !== null :
      null;
    const hasUnicodeSequence = hasRawValue ?
      /\\u[a-fA-F0-9]{4}/g.exec(node.raw!) !== null :
      null;
    const isBase64 = isStringBase64(
      String(node.value),
      { allowEmpty: false }
    );

    if ((hasHexadecimalSequence || hasUnicodeSequence) && isBase64) {
      if (inArrayExpr) {
        this.deobfuscator.encodedArrayValue++;
      }
      else {
        this.addEncodedLiteral(node.value, node.loc);
      }
    }
  }

  getResult(
    isMinified: boolean
  ): { idsLengthAvg: number; stringScore: number; warnings: Warning[]; } {
    const obfuscatorName = this.deobfuscator.assertObfuscation();
    if (obfuscatorName !== null) {
      this.warnings.push(
        generateWarning("obfuscated-code", { value: obfuscatorName })
      );
    }

    const identifiersLengthArr = this.deobfuscator.identifiers
      .filter((value) => value.type !== "Property" && typeof value.name === "string")
      .map((value) => value.name.length);

    const [idsLengthAvg, stringScore] = [
      sum(identifiersLengthArr),
      sum(this.deobfuscator.literalScores)
    ];
    if (!isMinified && identifiersLengthArr.length > 5 && idsLengthAvg <= 1.5) {
      this.warnings.push(
        generateWarning("short-identifiers", { value: String(idsLengthAvg) })
      );
    }
    if (stringScore >= 3) {
      this.warnings.push(
        generateWarning("suspicious-literal", { value: String(stringScore) })
      );
    }

    if (this.encodedLiterals.size > kMaximumEncodedLiterals) {
      this.warnings.push(
        generateWarning("suspicious-file", { value: null })
      );
      this.warnings = this.warnings
        .filter((warning) => warning.kind !== "encoded-literal");
    }

    return {
      idsLengthAvg,
      stringScore,
      warnings: this.warnings
    };
  }

  walk(
    node: ESTree.Node
  ): ESTree.Node[] {
    const split = InlinedRequire.split(node);
    if (split !== null) {
      this.tracer.walk(split.virtualDeclaration);
      if (split.rebuildExpression) {
        this.tracer.walk(split.rebuildExpression);
      }

      return [
        split.virtualDeclaration,
        ...(split.rebuildExpression ? [split.rebuildExpression] : [])
      ];
    }

    this.tracer.walk(node);
    this.deobfuscator.walk(node);

    // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
    if (node.type === "TryStatement" && node.handler) {
      this.inTryStatement = true;
    }
    else if (node.type === "CatchClause") {
      this.inTryStatement = false;
    }

    return [node];
  }
}

export class SourceFilePath {
  location: string | null = null;

  use(
    location?: string
  ) {
    this.location = location ?? null;
  }

  resolve(
    ...parts: string[]
  ) {
    if (this.location === null) {
      return path.posix.join(...parts);
    }

    return path.posix.join(this.location, ...parts);
  }
}

function sum(
  arr: number[] = []
): number {
  return arr.length === 0 ? 0 : (arr.reduce((prev, curr) => prev + curr, 0) / arr.length);
}

// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { Literal, Utils } from "@nodesecure/sec-literal";
import { VariableTracer } from "@nodesecure/tracer";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { Dependency } from "./AstAnalyser.ts";
import { Deobfuscator } from "./Deobfuscator.ts";
import { rootLocation, toArrayLocation } from "./utils/index.ts";
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

  constructor(sourceLocation?: string) {
    this.path.use(sourceLocation);
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
    location = rootLocation()
  ) {
    if (this.encodedLiterals.size > kMaximumEncodedLiterals) {
      return;
    }

    if (this.encodedLiterals.has(value)) {
      const index = this.encodedLiterals.get(value)!;
      this.warnings[index].location.push(toArrayLocation(location));

      return;
    }

    this.warnings.push(generateWarning("encoded-literal", { value, location }));
    this.encodedLiterals.set(value, String(this.warnings.length - 1));
  }

  analyzeLiteral(
    node: any,
    inArrayExpr = false
  ) {
    if (typeof node.value !== "string" || Utils.isSvg(node)) {
      return;
    }
    this.deobfuscator.analyzeString(node.value);

    const {
      hasHexadecimalSequence,
      hasUnicodeSequence,
      isBase64
    } = Literal.defaultAnalysis(node)!;
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
  ): void {
    this.tracer.walk(node);
    this.deobfuscator.walk(node);

    // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
    if (node.type === "TryStatement" && node.handler) {
      this.inTryStatement = true;
    }
    else if (node.type === "CatchClause") {
      this.inTryStatement = false;
    }
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

// Import Third-party Dependencies
import { Utils, Literal } from "@nodesecure/sec-literal";
import { VariableTracer } from "@nodesecure/tracer";

// Import Internal Dependencies
import { rootLocation, toArrayLocation } from "./utils/index.js";
import { generateWarning } from "./warnings.js";
import { ProbeRunner } from "./ProbeRunner.js";
import { Deobfuscator } from "./Deobfuscator.js";
import * as trojan from "./obfuscators/trojan-source.js";

// CONSTANTS
const kMaximumEncodedLiterals = 10;

export class SourceFile {
  inTryStatement = false;
  dependencyAutoWarning = false;
  deobfuscator = new Deobfuscator();
  dependencies = new Map();
  encodedLiterals = new Map();
  warnings = [];
  /** @type {Set<string>} */
  flags = new Set();

  constructor(sourceCodeString, probesOptions = {}) {
    this.tracer = new VariableTracer()
      .enableDefaultTracing()
      .trace("crypto.createHash", {
        followConsecutiveAssignment: true, moduleName: "crypto"
      });

    let probes = ProbeRunner.Defaults;
    if (Array.isArray(probesOptions.customProbes) && probesOptions.customProbes.length > 0) {
      probes = probesOptions.skipDefaultProbes === true ? probesOptions.customProbes : [...probes, ...probesOptions.customProbes];
    }
    this.probesRunner = new ProbeRunner(this, probes);

    if (trojan.verify(sourceCodeString)) {
      this.addWarning("obfuscated-code", "trojan-source");
    }
  }

  addDependency(name, location = null, unsafe = this.dependencyAutoWarning) {
    if (typeof name !== "string" || name.trim() === "") {
      return;
    }

    const dependencyName = name.charAt(name.length - 1) === "/" ?
      name.slice(0, -1) : name;
    this.dependencies.set(dependencyName, {
      unsafe,
      inTry: this.inTryStatement,
      ...(location === null ? {} : { location })
    });

    if (this.dependencyAutoWarning) {
      this.addWarning("unsafe-import", dependencyName, location);
    }
  }

  addWarning(name, value, location = rootLocation()) {
    const isEncodedLiteral = name === "encoded-literal";
    if (isEncodedLiteral) {
      if (this.encodedLiterals.size > kMaximumEncodedLiterals) {
        return;
      }

      if (this.encodedLiterals.has(value)) {
        const index = this.encodedLiterals.get(value);
        this.warnings[index].location.push(toArrayLocation(location));

        return;
      }
    }

    this.warnings.push(generateWarning(name, { value, location }));
    if (isEncodedLiteral) {
      this.encodedLiterals.set(value, this.warnings.length - 1);
    }
  }

  analyzeLiteral(node, inArrayExpr = false) {
    if (typeof node.value !== "string" || Utils.isSvg(node)) {
      return;
    }
    this.deobfuscator.analyzeString(node.value);

    const { hasHexadecimalSequence, hasUnicodeSequence, isBase64 } = Literal.defaultAnalysis(node);
    if ((hasHexadecimalSequence || hasUnicodeSequence) && isBase64) {
      if (inArrayExpr) {
        this.deobfuscator.encodedArrayValue++;
      }
      else {
        this.addWarning("encoded-literal", node.value, node.loc);
      }
    }
  }

  getResult(isMinified) {
    const obfuscatorName = this.deobfuscator.assertObfuscation(this);
    if (obfuscatorName !== null) {
      this.addWarning("obfuscated-code", obfuscatorName);
    }

    const identifiersLengthArr = this.deobfuscator.identifiers
      .filter((value) => value.type !== "Property" && typeof value.name === "string")
      .map((value) => value.name.length);

    const [idsLengthAvg, stringScore] = [
      sum(identifiersLengthArr),
      sum(this.deobfuscator.literalScores)
    ];
    if (!isMinified && identifiersLengthArr.length > 5 && idsLengthAvg <= 1.5) {
      this.addWarning("short-identifiers", idsLengthAvg);
    }
    if (stringScore >= 3) {
      this.addWarning("suspicious-literal", stringScore);
    }

    if (this.encodedLiterals.size > kMaximumEncodedLiterals) {
      this.addWarning("suspicious-file", null);
      this.warnings = this.warnings
        .filter((warning) => warning.kind !== "encoded-literal");
    }

    return { idsLengthAvg, stringScore, warnings: this.warnings };
  }

  walk(node) {
    this.tracer.walk(node);
    this.deobfuscator.walk(node);

    // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
    if (node.type === "TryStatement" && node.handler) {
      this.inTryStatement = true;
    }
    else if (node.type === "CatchClause") {
      this.inTryStatement = false;
    }

    return this.probesRunner.walk(node);
  }
}

function sum(arr = []) {
  return arr.length === 0 ? 0 : (arr.reduce((prev, curr) => prev + curr, 0) / arr.length);
}

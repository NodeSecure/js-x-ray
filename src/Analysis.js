// Import Third-party Dependencies
import { Utils, Literal } from "@nodesecure/sec-literal";
import { VariableTracer } from "@nodesecure/estree-ast-utils";

// Import Internal Dependencies
import { rootLocation, toArrayLocation } from "./utils.js";
import { generateWarning } from "./warnings.js";
import ASTDeps from "./ASTDeps.js";
import { isObfuscatedCode, hasTrojanSource } from "./obfuscators/index.js";
import { runOnProbes } from "./probes/index.js";

// CONSTANTS
const kDictionaryStrParts = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789"
];

const kMaximumEncodedLiterals = 10;

export default class Analysis {
  hasDictionaryString = false;
  hasPrefixedIdentifiers = false;
  varkinds = { var: 0, let: 0, const: 0 };
  idtypes = { assignExpr: 0, property: 0, variableDeclarator: 0, functionDeclaration: 0 };
  counter = {
    identifiers: 0,
    doubleUnaryArray: 0,
    computedMemberExpr: 0,
    memberExpr: 0,
    deepBinaryExpr: 0,
    encodedArrayValue: 0,
    morseLiteral: 0
  };
  identifiersName = [];

  constructor() {
    this.tracer = new VariableTracer()
      .enableDefaultTracing()
      .trace("crypto.createHash", {
        followConsecutiveAssignment: true, moduleName: "crypto"
      });

    this.dependencies = new ASTDeps();
    this.encodedLiterals = new Map();
    this.warnings = [];
    this.literalScores = [];
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

  analyzeSourceString(sourceString) {
    if (hasTrojanSource(sourceString)) {
      this.addWarning("obfuscated-code", "trojan-source");
    }
  }

  analyzeString(str) {
    const score = Utils.stringSuspicionScore(str);
    if (score !== 0) {
      this.literalScores.push(score);
    }

    if (!this.hasDictionaryString) {
      const isDictionaryStr = kDictionaryStrParts.every((word) => str.includes(word));
      if (isDictionaryStr) {
        this.hasDictionaryString = true;
      }
    }

    // Searching for morse string like "--.- --.--."
    if (Utils.stringCharDiversity(str, ["\n"]) >= 3 && Utils.isMorse(str)) {
      this.counter.morseLiteral++;
    }
  }

  analyzeLiteral(node, inArrayExpr = false) {
    if (typeof node.value !== "string" || Utils.isSvg(node)) {
      return;
    }
    this.analyzeString(node.value);

    const { hasHexadecimalSequence, hasUnicodeSequence, isBase64 } = Literal.defaultAnalysis(node);
    if ((hasHexadecimalSequence || hasUnicodeSequence) && isBase64) {
      if (inArrayExpr) {
        this.counter.encodedArrayValue++;
      }
      else {
        this.addWarning("encoded-literal", node.value, node.loc);
      }
    }
  }

  getResult(isMinified) {
    this.counter.identifiers = this.identifiersName.length;
    const [isObfuscated, kind] = isObfuscatedCode(this);
    if (isObfuscated) {
      this.addWarning("obfuscated-code", kind);
    }

    const identifiersLengthArr = this.identifiersName
      .filter((value) => value.type !== "property" && typeof value.name === "string")
      .map((value) => value.name.length);

    const [idsLengthAvg, stringScore] = [sum(identifiersLengthArr), sum(this.literalScores)];
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

    // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
    if (node.type === "TryStatement" && typeof node.handler !== "undefined") {
      this.dependencies.isInTryStmt = true;
    }
    else if (node.type === "CatchClause") {
      this.dependencies.isInTryStmt = false;
    }

    return runOnProbes(node, this);
  }
}

function sum(arr = []) {
  return arr.length === 0 ? 0 : (arr.reduce((prev, curr) => prev + curr, 0) / arr.length);
}

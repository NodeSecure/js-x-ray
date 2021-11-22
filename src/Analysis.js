// Import Third-party Dependencies
import { Utils, Literal } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import { rootLocation, toArrayLocation, generateWarning } from "./utils.js";
import { warnings as _warnings, processMainModuleRequire } from "./constants.js";
import ASTDeps from "./ASTDeps.js";
import { isObfuscatedCode, hasTrojanSource } from "./obfuscators/index.js";
import { runOnProbes } from "./probes/index.js";

// CONSTANTS
const kDictionaryStrParts = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789"
];

const kWarningsNameStr = Object.freeze({
  [_warnings.parsingError]: "parsing-error",
  [_warnings.unsafeImport]: "unsafe-import",
  [_warnings.unsafeRegex]: "unsafe-regex",
  [_warnings.unsafeStmt]: "unsafe-stmt",
  [_warnings.unsafeAssign]: "unsafe-assign",
  [_warnings.encodedLiteral]: "encoded-literal",
  [_warnings.shortIdentifiers]: "short-identifiers",
  [_warnings.suspiciousLiteral]: "suspicious-literal",
  [_warnings.obfuscatedCode]: "obfuscated-code"
});

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
    this.dependencies = new ASTDeps();

    this.identifiers = new Map();
    this.globalParts = new Map();
    this.handledEncodedLiteralValues = new Map();

    this.requireIdentifiers = new Set(["require", processMainModuleRequire]);
    this.warnings = [];
    this.literalScores = [];
  }

  addWarning(symbol, value, location = rootLocation()) {
    if (symbol === _warnings.encodedLiteral && this.handledEncodedLiteralValues.has(value)) {
      const index = this.handledEncodedLiteralValues.get(value);
      this.warnings[index].location.push(toArrayLocation(location));

      return;
    }
    const warningName = kWarningsNameStr[symbol];
    this.warnings.push(generateWarning(warningName, { value, location }));
    if (symbol === _warnings.encodedLiteral) {
      this.handledEncodedLiteralValues.set(value, this.warnings.length - 1);
    }
  }

  analyzeSourceString(sourceString) {
    if (hasTrojanSource(sourceString)) {
      this.addWarning(_warnings.obfuscatedCode, "trojan-source");
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
        this.addWarning(_warnings.encodedLiteral, node.value, node.loc);
      }
    }
  }

  getResult(isMinified) {
    this.counter.identifiers = this.identifiersName.length;
    const [isObfuscated, kind] = isObfuscatedCode(this);
    if (isObfuscated) {
      this.addWarning(_warnings.obfuscatedCode, kind || "unknown");
    }

    const identifiersLengthArr = this.identifiersName
      .filter((value) => value.type !== "property" && typeof value.name === "string").map((value) => value.name.length);

    const [idsLengthAvg, stringScore] = [sum(identifiersLengthArr), sum(this.literalScores)];
    if (!isMinified && identifiersLengthArr.length > 5 && idsLengthAvg <= 1.5) {
      this.addWarning(_warnings.shortIdentifiers, idsLengthAvg);
    }
    if (stringScore >= 3) {
      this.addWarning(_warnings.suspiciousLiteral, stringScore);
    }

    return { idsLengthAvg, stringScore, warnings: this.warnings };
  }

  walk(node) {
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

Analysis.Warnings = _warnings;

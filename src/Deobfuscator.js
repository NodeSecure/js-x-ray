// Import Third-party Dependencies
import { getVariableDeclarationIdentifiers } from "@nodesecure/estree-ast-utils";
import { Utils, Patterns } from "@nodesecure/sec-literal";
import { match } from "ts-pattern";

// Import Internal Dependencies
import { NodeCounter } from "./NodeCounter.js";
import { extractNode } from "./utils/index.js";

import * as jjencode from "./obfuscators/jjencode.js";
import * as jsfuck from "./obfuscators/jsfuck.js";
import * as freejsobfuscator from "./obfuscators/freejsobfuscator.js";
import * as obfuscatorio from "./obfuscators/obfuscator-io.js";

// CONSTANTS
const kIdentifierNodeExtractor = extractNode("Identifier");
const kDictionaryStrParts = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789"
];
const kMinimumIdsCount = 5;

export class Deobfuscator {
  deepBinaryExpression = 0;
  encodedArrayValue = 0;
  hasDictionaryString = false;
  hasPrefixedIdentifiers = false;

  /** @type {Set<string>} */
  morseLiterals = new Set();

  /** @type {number[]} */
  literalScores = [];

  /** @type {({ name: string; type: string; })[]} */
  identifiers = [];

  #counters = [
    new NodeCounter("VariableDeclaration[kind]"),
    new NodeCounter("AssignmentExpression", {
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.left)
    }),
    new NodeCounter("FunctionDeclaration", {
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.id)
    }),
    new NodeCounter("MemberExpression[computed]"),
    new NodeCounter("Property", {
      filter: (node) => node.key.type === "Identifier",
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.key)
    }),
    new NodeCounter("UnaryExpression", {
      name: "DoubleUnaryExpression",
      filter: ({ argument }) => argument.type === "UnaryExpression" && argument.argument.type === "ArrayExpression"
    }),
    new NodeCounter("VariableDeclarator", {
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.id)
    })
  ];

  /**
   * @param {!NodeCounter} nc
   * @param {*} node
   */
  #extractCounterIdentifiers(nc, node) {
    if (node === null) {
      return;
    }
    const { type } = nc;

    switch (type) {
      case "VariableDeclarator":
      case "AssignmentExpression": {
        for (const { name } of getVariableDeclarationIdentifiers(node)) {
          this.identifiers.push({ name, type });
        }
        break;
      }
      case "Property":
      case "FunctionDeclaration":
        this.identifiers.push({ name: node.name, type });
        break;
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

    // Searching for morse string like "--.- --.--"
    if (Utils.isMorse(str)) {
      this.morseLiterals.add(str);
    }
  }

  walk(node) {
    const { type } = node;

    const isFunctionParams = node.type === "FunctionDeclaration" || node.type === "FunctionExpression";
    const nodesToExtract = match(type)
      .with("ClassDeclaration", () => [node.id, node.superClass])
      .with("FunctionDeclaration", () => node.params)
      .with("FunctionExpression", () => node.params)
      .with("MethodDefinition", () => [node.key])
      .otherwise(() => []);

    kIdentifierNodeExtractor(
      ({ name }) => this.identifiers.push({ name, type: isFunctionParams ? "FunctionParams" : type }),
      nodesToExtract
    );

    this.#counters.forEach((counter) => counter.walk(node));
  }

  aggregateCounters() {
    const defaultValue = {
      Identifiers: this.identifiers.length
    };

    return this.#counters.reduce((result, counter) => {
      result[counter.name] = counter.lookup ?
        counter.properties :
        counter.count;

      return result;
    }, defaultValue);
  }

  #calcAvgPrefixedIdentifiers(
    counters,
    prefix
  ) {
    const valuesArr = Object
      .values(prefix)
      .slice()
      .sort((left, right) => left - right);
    if (valuesArr.length === 0) {
      return 0;
    }

    const nbOfPrefixedIds = valuesArr.length === 1 ?
      valuesArr.pop() :
      (valuesArr.pop() + valuesArr.pop());
    const maxIds = counters.Identifiers - counters.Property;

    return ((nbOfPrefixedIds / maxIds) * 100);
  }

  assertObfuscation() {
    const counters = this.aggregateCounters();

    if (jsfuck.verify(counters)) {
      return "jsfuck";
    }
    if (jjencode.verify(this.identifiers, counters)) {
      return "jjencode";
    }
    if (this.morseLiterals.size >= 36) {
      return "morse";
    }

    const { prefix } = Patterns.commonHexadecimalPrefix(
      this.identifiers.flatMap(
        ({ name }) => (typeof name === "string" ? [name] : [])
      )
    );
    const uPrefixNames = new Set(Object.keys(prefix));

    if (this.identifiers.length > kMinimumIdsCount && uPrefixNames.size > 0) {
      this.hasPrefixedIdentifiers = this.#calcAvgPrefixedIdentifiers(counters, prefix) > 80;
    }

    if (uPrefixNames.size === 1 && freejsobfuscator.verify(this.identifiers, prefix)) {
      return "freejsobfuscator";
    }
    if (obfuscatorio.verify(this, counters)) {
      return "obfuscator.io";
    }
    // if ((identifierLength > (kMinimumIdsCount * 3) && this.hasPrefixedIdentifiers)
    //     && (oneTimeOccurence <= 3 || this.encodedArrayValue > 0)) {
    //     return "unknown";
    // }

    return null;
  }
}

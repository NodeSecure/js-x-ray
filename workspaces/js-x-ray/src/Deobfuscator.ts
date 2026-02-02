// Import Third-party Dependencies
import { Patterns, Utils } from "@nodesecure/sec-literal";
import type { ESTree } from "meriyah";
import { match } from "ts-pattern";

// Import Internal Dependencies
import { getVariableDeclarationIdentifiers } from "./estree/index.ts";
import { NodeCounter } from "./NodeCounter.ts";
import { extractNode } from "./utils/index.ts";

import * as freejsobfuscator from "./obfuscators/freejsobfuscator.ts";
import * as jjencode from "./obfuscators/jjencode.ts";
import * as jsfuck from "./obfuscators/jsfuck.ts";
import * as obfuscatorio from "./obfuscators/obfuscator-io.ts";

// CONSTANTS
const kIdentifierNodeExtractor = extractNode<ESTree.Identifier>("Identifier");
const kDictionaryStrParts = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789"
];
const kMinimumIdsCount = 5;

export type ObfuscatedEngine =
  | "jsfuck"
  | "jjencode"
  | "morse"
  | "freejsobfuscator"
  | "obfuscator.io"
  | "unknown";

export interface ObfuscatedIdentifier {
  name: string;
  type: string;
}

export interface ObfuscatedCounters {
  Identifiers: number;
  VariableDeclaration?: {
    const?: number;
    let?: number;
    var?: number;
  };
  VariableDeclarator?: number;
  AssignmentExpression?: number;
  FunctionDeclaration?: number;
  MemberExpression?: Record<string, number>;
  Property?: number;
  UnaryExpression?: number;
  DoubleUnaryExpression?: number;
}

export class Deobfuscator {
  deepBinaryExpression = 0;
  encodedArrayValue = 0;
  hasDictionaryString = false;
  hasPrefixedIdentifiers = false;

  morseLiterals = new Set<string>();
  literalScores: number[] = [];

  identifiers: ObfuscatedIdentifier[] = [];

  #counters = [
    new NodeCounter<ESTree.VariableDeclaration>("VariableDeclaration[kind]"),
    new NodeCounter<ESTree.AssignmentExpression>("AssignmentExpression", {
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.left)
    }),
    new NodeCounter<ESTree.FunctionDeclaration>("FunctionDeclaration", {
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.id)
    }),
    new NodeCounter<ESTree.MemberExpression>("MemberExpression[computed]"),
    new NodeCounter<ESTree.Property>("Property", {
      filter: (node) => node.key.type === "Identifier",
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.key)
    }),
    new NodeCounter<ESTree.UnaryExpression>("UnaryExpression", {
      name: "DoubleUnaryExpression",
      filter: ({ argument }) => argument.type === "UnaryExpression" && argument.argument.type === "ArrayExpression"
    }),
    new NodeCounter<ESTree.VariableDeclarator>("VariableDeclarator", {
      match: (node, nc) => this.#extractCounterIdentifiers(nc, node.id)
    })
  ];

  #extractCounterIdentifiers(
    nc: NodeCounter<any>,
    node: ESTree.Node | null
  ) {
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
        if (node.type === "Identifier") {
          this.identifiers.push({ name: node.name, type });
        }
        break;
    }
  }

  analyzeString(
    str: string
  ): void {
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

  walk(
    node: ESTree.Node
  ): void {
    const nodesToExtract = match(node)
      .with({ type: "ClassDeclaration" }, (node) => [node.id, node.superClass])
      .with({ type: "FunctionDeclaration" }, (node) => node.params)
      .with({ type: "FunctionExpression" }, (node) => node.params)
      .with({ type: "MethodDefinition" }, (node) => [node.key])
      .otherwise(() => []);

    const isFunctionParams =
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression";

    kIdentifierNodeExtractor(
      ({ name }) => this.identifiers.push({
        name,
        type: isFunctionParams ? "FunctionParams" : node.type
      }),
      nodesToExtract
    );

    this.#counters.forEach((counter) => counter.walk(node));
  }

  aggregateCounters(): ObfuscatedCounters {
    return this.#counters.reduce((result, counter) => {
      result[counter.name] = counter.lookup ?
        counter.properties :
        counter.count;

      return result;
    }, {
      Identifiers: this.identifiers.length
    });
  }

  #calcAvgPrefixedIdentifiers(
    counters: ObfuscatedCounters,
    prefix: Record<string, number>
  ): number {
    const valuesArr = Object
      .values(prefix)
      .slice()
      .sort((left, right) => left - right);
    if (valuesArr.length === 0) {
      return 0;
    }

    const nbOfPrefixedIds = valuesArr.length === 1 ?
      valuesArr.pop()! :
      (valuesArr.pop()! + valuesArr.pop()!);
    const maxIds = counters.Identifiers - (counters.Property ?? 0);

    return ((nbOfPrefixedIds / maxIds) * 100);
  }

  assertObfuscation(): ObfuscatedEngine | null {
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

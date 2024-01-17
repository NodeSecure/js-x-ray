// Import Native Dependencies
import assert from "node:assert";

// Import all the probes
import isUnsafeCallee from "./probes/isUnsafeCallee.js";
import isLiteral from "./probes/isLiteral.js";
import isLiteralRegex from "./probes/isLiteralRegex.js";
import isRegexObject from "./probes/isRegexObject.js";
import isVariableDeclaration from "./probes/isVariableDeclaration.js";
import isRequire from "./probes/isRequire.js";
import isImportDeclaration from "./probes/isImportDeclaration.js";
import isMemberExpression from "./probes/isMemberExpression.js";
import isArrayExpression from "./probes/isArrayExpression.js";
import isFunction from "./probes/isFunction.js";
import isAssignmentExpression from "./probes/isAssignmentExpression.js";
import isObjectExpression from "./probes/isObjectExpression.js";
import isUnaryExpression from "./probes/isUnaryExpression.js";
import isWeakCrypto from "./probes/isWeakCrypto.js";
import isClassDeclaration from "./probes/isClassDeclaration.js";
import isMethodDefinition from "./probes/isMethodDefinition.js";

// Import Internal Dependencies
import { SourceFile } from "./SourceFile.js";

/**
 * @typedef {Object} Probe
 * @property {string} name
 * @property {any} validateNode
 * @property {(node: any, options: any) => any} main
 * @property {(options: any) => void} teardown
 * @property {boolean} [breakOnMatch=false]
 * @property {string} [breakGroup]
 */

export const ProbeSignals = Object.freeze({
  Break: Symbol.for("breakWalk"),
  Skip: Symbol.for("skipWalk")
});

export class ProbeRunner {
  /**
   * Note:
   * The order of the table has an importance/impact on the correct execution of the probes
   *
   * @type {Probe[]}
   */
  static Defaults = [
    isRequire,
    isUnsafeCallee,
    isLiteral,
    isLiteralRegex,
    isRegexObject,
    isVariableDeclaration,
    isImportDeclaration,
    isMemberExpression,
    isAssignmentExpression,
    isObjectExpression,
    isArrayExpression,
    isFunction,
    isUnaryExpression,
    isWeakCrypto,
    isClassDeclaration,
    isMethodDefinition
  ];

  /**
   *
   * @param {!SourceFile} sourceFile
   * @param {Probe[]} [probes=ProbeRunner.Defaults]
   */
  constructor(
    sourceFile,
    probes = ProbeRunner.Defaults
  ) {
    this.sourceFile = sourceFile;

    for (const probe of probes) {
      assert(
        typeof probe.validateNode === "function" || Array.isArray(probe.validateNode),
        `Invalid probe ${probe.name}: validateNode must be a function or an array of functions`
      );
      assert(
        typeof probe.main === "function",
        `Invalid probe ${probe.name}: main must be a function`
      );
    }

    this.probes = probes;
  }

  /**
   * @param {!Probe} probe
   * @param {!any} node
   * @returns {null|void|Symbol}
   */
  #runProbe(probe, node) {
    const validationFns = Array.isArray(probe.validateNode) ?
      probe.validateNode : [probe.validateNode];
    for (const validateNode of validationFns) {
      const [isMatching, data = null] = validateNode(
        node,
        this.sourceFile
      );

      if (isMatching) {
        return probe.main(node, {
          analysis: this.sourceFile,
          data
        });
      }
    }

    return null;
  }

  walk(node) {
    /** @type {Set<string>} */
    const breakGroups = new Set();

    for (const probe of this.probes) {
      if (breakGroups.has(probe.breakGroup)) {
        continue;
      }

      try {
        const result = this.#runProbe(probe, node);
        if (result === null) {
          continue;
        }

        if (result === ProbeSignals.Skip) {
          return "skip";
        }
        if (result === ProbeSignals.Break || probe.breakOnMatch) {
          const breakGroup = probe.breakGroup || null;

          if (breakGroup === null) {
            break;
          }
          else {
            breakGroups.add(breakGroup);
          }
        }
      }
      finally {
        if (probe.teardown) {
          probe.teardown({ analysis: this.sourceFile });
        }
      }
    }

    return null;
  }
}

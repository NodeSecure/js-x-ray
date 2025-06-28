// Import Node.js Dependencies
import assert from "node:assert";

// Import Internal Dependencies
import isUnsafeCallee from "./probes/isUnsafeCallee.js";
import isLiteral from "./probes/isLiteral.js";
import isLiteralRegex from "./probes/isLiteralRegex.js";
import isRegexObject from "./probes/isRegexObject.js";
import isRequire from "./probes/isRequire/isRequire.js";
import isImportDeclaration from "./probes/isImportDeclaration.js";
import isWeakCrypto from "./probes/isWeakCrypto.js";
import isBinaryExpression from "./probes/isBinaryExpression.js";
import isArrayExpression from "./probes/isArrayExpression.js";
import isESMExport from "./probes/isESMExport.js";
import isFetch from "./probes/isFetch.js";
import isUnsafeCommand from "./probes/isUnsafeCommand.js";
import isSyncIO from "./probes/isSyncIO.js";

/**
 * @typedef {import('./SourceFile.js').SourceFile} SourceFile
 */

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
    isFetch,
    isRequire,
    isESMExport,
    isUnsafeCallee,
    isLiteral,
    isLiteralRegex,
    isRegexObject,
    isImportDeclaration,
    isWeakCrypto,
    isBinaryExpression,
    isArrayExpression,
    isUnsafeCommand
  ];

  /**
   *
   * @type {Record<string,Probe>}
   */
  static Optionals = {
    "synchronous-io": isSyncIO
  };

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
          sourceFile: this.sourceFile,
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
          probe.teardown({ sourceFile: this.sourceFile });
        }
      }
    }

    return null;
  }
}

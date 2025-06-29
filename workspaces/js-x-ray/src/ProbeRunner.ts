// Import Node.js Dependencies
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

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
import isSerializeEnv from "./probes/isSerializeEnv.js";

import type { SourceFile } from "./SourceFile.js";
import type { OptionalWarningName } from "./warnings.js";

export type ProbeReturn = void | null | symbol;
export type ProbeInitializeCallback = (sourceFile: SourceFile) => void;
export type ProbeMainCallback = (
  node: any,
  options: { sourceFile: SourceFile; data?: any; }
) => ProbeReturn;
export type ProbeTeardownCallback = (options: { sourceFile: SourceFile; }) => void;
export type ProbeValidationCallback = (node: ESTree.Node, sourceFile: SourceFile) => [boolean, any?];

export interface Probe {
  name: string;
  initialize?: ProbeInitializeCallback;
  validateNode: ProbeValidationCallback | ProbeValidationCallback[];
  main: ProbeMainCallback;
  teardown?: ProbeTeardownCallback;
  breakOnMatch?: boolean;
  breakGroup?: string;
}

export const ProbeSignals = Object.freeze({
  Break: Symbol.for("breakWalk"),
  Skip: Symbol.for("skipWalk")
});

export class ProbeRunner {
  probes: Probe[];
  sourceFile: SourceFile;

  /**
   * Note:
   * The order of the table has an importance/impact on the correct execution of the probes
   */
  static Defaults: Probe[] = [
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
    isUnsafeCommand,
    isSerializeEnv
  ];

  static Optionals: Record<OptionalWarningName, Probe> = {
    "synchronous-io": isSyncIO
  };

  constructor(
    sourceFile: SourceFile,
    probes: Probe[] = ProbeRunner.Defaults
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
      assert(
        typeof probe.initialize === "function" || probe.initialize === undefined,
        `Invalid probe ${probe.name}: initialize must be a function or undefined`
      );
      if (probe.initialize) {
        probe.initialize(sourceFile);
      }
    }

    this.probes = probes;
  }

  #runProbe(
    probe: Probe,
    node: ESTree.Node
  ): ProbeReturn {
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

  walk(
    node: ESTree.Node
  ): null | "skip" {
    const breakGroups = new Set<string>();

    for (const probe of this.probes) {
      if (probe.breakGroup && breakGroups.has(probe.breakGroup)) {
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

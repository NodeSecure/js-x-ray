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
export type ProbeContextDef = Record<string, any>;
export type ProbeContext<T extends ProbeContextDef = ProbeContextDef> = {
  sourceFile: SourceFile;
  context?: T;
};

export type ProbeValidationCallback<T extends ProbeContextDef = ProbeContextDef> = (
  node: ESTree.Node, ctx: ProbeContext<T>
) => [boolean, any?];

export interface Probe<T extends ProbeContextDef = ProbeContextDef> {
  name: string;
  initialize?: (ctx: ProbeContext<T>) => void | ProbeContext;
  finalize?: (ctx: ProbeContext<T>) => void;
  validateNode: ProbeValidationCallback<T> | ProbeValidationCallback<T>[];
  main: (
    node: any,
    ctx: ProbeContext<T> & { data?: any; }
  ) => ProbeReturn;
  teardown?: (ctx: ProbeContext<T>) => void;
  breakOnMatch?: boolean;
  breakGroup?: string;
  context?: ProbeContext<T>;
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
        const context = probe.initialize(this.#getProbeContext(probe));
        if (context) {
          probe.context = context;
        }
      }
    }

    this.probes = probes;
  }

  #getProbeContext(
    probe: Probe
  ): ProbeContext {
    return {
      sourceFile: this.sourceFile,
      context: probe.context
    };
  }

  #runProbe(
    probe: Probe,
    node: ESTree.Node
  ): ProbeReturn {
    const validationFns = Array.isArray(probe.validateNode) ?
      probe.validateNode : [probe.validateNode];
    const ctx = this.#getProbeContext(probe);

    for (const validateNode of validationFns) {
      const [isMatching, data = null] = validateNode(
        node,
        ctx
      );

      if (isMatching) {
        return probe.main(node, {
          ...ctx,
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
        probe.teardown?.(this.#getProbeContext(probe));
      }
    }

    return null;
  }

  finalize(): void {
    for (const probe of this.probes) {
      probe.finalize?.(this.#getProbeContext(probe));
    }
  }
}

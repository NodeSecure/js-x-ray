// Import Node.js Dependencies
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import dataExfiltration from "./probes/data-exfiltration.ts";
import isArrayExpression from "./probes/isArrayExpression.ts";
import isBinaryExpression from "./probes/isBinaryExpression.ts";
import isESMExport from "./probes/isESMExport.ts";
import isFetch from "./probes/isFetch.ts";
import isImportDeclaration from "./probes/isImportDeclaration.ts";
import isLiteral from "./probes/isLiteral.ts";
import isLiteralRegex from "./probes/isLiteralRegex.ts";
import isRegexObject from "./probes/isRegexObject.ts";
import isRequire from "./probes/isRequire/isRequire.ts";
import isSerializeEnv from "./probes/isSerializeEnv.ts";
import isSyncIO from "./probes/isSyncIO.ts";
import isUnsafeCallee from "./probes/isUnsafeCallee.ts";
import isUnsafeCommand from "./probes/isUnsafeCommand.ts";
import isWeakCrypto from "./probes/isWeakCrypto.ts";

import type { SourceFile } from "./SourceFile.ts";
import type { OptionalWarningName } from "./warnings.ts";
import type { CollectableSetRegistry } from "./CollectableSetRegistry.ts";

// CONSTANTS
const kProbeOriginalContext = Symbol.for("ProbeOriginalContext");

export type ProbeReturn = void | null | symbol;
export type ProbeContextDef = Record<string, any>;

// Named main handlers type for probes with multiple entry points
export type NamedMainHandlers<T extends ProbeContextDef = ProbeContextDef> = {
  default: (node: any, ctx: ProbeMainContext<T>) => ProbeReturn;
  [handlerName: string]: (node: any, ctx: ProbeMainContext<T>) => ProbeReturn;
};

export type ProbeContext<T extends ProbeContextDef = ProbeContextDef> = {
  sourceFile: SourceFile;
  collectableSetRegistry: CollectableSetRegistry;
  context?: T;
  setEntryPoint: (handlerName: string) => void;
};
export type ProbeMainContext<T extends ProbeContextDef = ProbeContextDef> = ProbeContext<T> & {
  data?: any;
  signals: typeof ProbeRunner.Signals;
};

export type ProbeValidationCallback<T extends ProbeContextDef = ProbeContextDef> = (
  node: ESTree.Node, ctx: ProbeContext<T>
) => [boolean, any?];

export interface Probe<T extends ProbeContextDef = ProbeContextDef> {
  name: string;
  initialize?: (ctx: ProbeContext<T>) => void | ProbeContext;
  finalize?: (ctx: ProbeContext<T>) => void;
  validateNode: ProbeValidationCallback<T> | ProbeValidationCallback<T>[];
  // Support both single function and named handlers
  main: ((node: any, ctx: ProbeMainContext<T>) => ProbeReturn) | NamedMainHandlers<T>;
  teardown?: (ctx: ProbeContext<T>) => void;
  breakOnMatch?: boolean;
  breakGroup?: string;
  context?: T;
}

export class ProbeRunner {
  probes: Probe[];
  sourceFile: SourceFile;
  #collectableSetRegistry: CollectableSetRegistry;
  // Store selected entry point per probe
  // CRITICAL: Cleared after each invocation to avoid bleed between nodes
  #selectedEntryPoints: Map<Probe, string> = new Map();

  static Signals = Object.freeze({
    Break: Symbol.for("breakWalk"),
    Skip: Symbol.for("skipWalk"),
    Continue: null
  });

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
    isSerializeEnv,
    dataExfiltration
  ];

  static Optionals: Record<OptionalWarningName, Probe> = {
    "synchronous-io": isSyncIO
  };

  constructor(
    sourceFile: SourceFile,
    collectableSetRegistry: CollectableSetRegistry,
    probes: Probe[] = ProbeRunner.Defaults
  ) {
    this.sourceFile = sourceFile;
    this.#collectableSetRegistry = collectableSetRegistry;

    for (const probe of probes) {
      assert(
        typeof probe.validateNode === "function" || Array.isArray(probe.validateNode),
        `Invalid probe ${probe.name}: validateNode must be a function or an array of functions`
      );
      // Validate main: either function or object with named handlers
      assert(
        typeof probe.main === "function" || typeof probe.main === "object",
        `Invalid probe ${probe.name}: main must be a function or an object with named handlers`
      );
      // If named handlers, ensure 'default' handler exists
      if (typeof probe.main === "object") {
        assert(
          "default" in probe.main && typeof probe.main.default === "function",
          `Invalid probe ${probe.name}: named main handlers must provide a 'default' handler`
        );
      }
      assert(
        typeof probe.initialize === "function" || probe.initialize === undefined,
        `Invalid probe ${probe.name}: initialize must be a function or undefined`
      );
      if (probe.initialize) {
        const isDefined = Reflect.defineProperty(probe, kProbeOriginalContext, {
          enumerable: false,
          value: structuredClone(probe.context),
          configurable: true
        });

        if (!isDefined) {
          throw new Error(`Failed to define original context for probe '${probe.name}'`);
        }

        const context = probe.initialize(this.#getProbeContext(probe));
        if (context) {
          probe.context = structuredClone(context);
        }
      }
    }

    this.probes = probes;
  }

  #getProbeContext(
    probe: Probe
  ): ProbeContext {
    const setEntryPoint = (handlerName: string) => {
      if (typeof probe.main === "object") {
        this.#selectedEntryPoints.set(probe, handlerName);
      }
      // If probe.main is a function, this call has no effect
    };

    return {
      sourceFile: this.sourceFile,
      collectableSetRegistry: this.#collectableSetRegistry,
      context: probe.context,
      setEntryPoint
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
        // Resolve which main handler to invoke
        let mainHandler: (node: any, ctx: ProbeMainContext) => ProbeReturn;

        if (typeof probe.main === "function") {
          mainHandler = probe.main;
        } else {
          // Named handlers: use selected or fallback to default
          const selectedName = this.#selectedEntryPoints.get(probe);
          const handlerName = (selectedName && selectedName in probe.main)
            ? selectedName
            : "default";
          mainHandler = probe.main[handlerName];
        }

        // CRITICAL: Clear entry point immediately after resolution
        // This prevents bleed between different nodes in the same file
        this.#selectedEntryPoints.delete(probe);

        // Invoke handler with same context/data as legacy main
        return mainHandler(node, {
          ...ctx,
          signals: ProbeRunner.Signals,
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
        const signal = this.#runProbe(probe, node);
        if (signal === ProbeRunner.Signals.Continue) {
          continue;
        }

        if (signal === ProbeRunner.Signals.Skip) {
          return "skip";
        }
        if (signal === ProbeRunner.Signals.Break || probe.breakOnMatch) {
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
      probe.context = probe[kProbeOriginalContext];
    }
  }
}

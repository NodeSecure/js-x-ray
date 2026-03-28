// Import Node.js Dependencies
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import logUsage from "./probes/log-usage.ts";
import sqlInjection from "./probes/sql-injection.ts";
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
import isMonkeyPatch from "./probes/isMonkeyPatch.ts";
import isRandom from "./probes/isRandom.ts";
import isPrototypePollution from "./probes/isPrototypePollution.ts";
import isWeakScrypt from "./probes/isWeakScrypt.ts";
import isWeakArgon2 from "./probes/isWeakArgon2.ts";

import type { TracedIdentifierReport } from "./VariableTracer.ts";
import type { SourceFile } from "./SourceFile.ts";
import type { OptionalWarningName } from "./warnings.ts";
import {
  getCallExpressionIdentifier
} from "./estree/index.ts";
import { CALL_EXPRESSION_DATA, CALL_EXPRESSION_IDENTIFIER } from "./contants.ts";

const kProbeOriginalContext = Symbol.for("ProbeOriginalContext");

export type ProbeReturn = void | null | symbol;
export type ProbeContextDef = Record<string | symbol, any>;

export type NamedMainHandlers<T extends ProbeContextDef = ProbeContextDef> = {
  default: (node: any, ctx: ProbeMainContext<T>) => ProbeReturn;
  [handlerName: string]: (node: any, ctx: ProbeMainContext<T>) => ProbeReturn;
};

export type ProbeContext<T extends ProbeContextDef = ProbeContextDef> = {
  sourceFile: SourceFile;
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
  main: ((node: any, ctx: ProbeMainContext<T>) => ProbeReturn) | NamedMainHandlers<T>;
  teardown?: (ctx: ProbeContext<T>) => void;
  breakOnMatch?: boolean;
  breakGroup?: string;
  context?: T;
}

export class ProbeRunner {
  probes: Probe[];
  sourceFile: SourceFile;
  #selectedEntryPoints: Map<Probe, string> = new Map();
  #breakGroups = new Set<string>();
  #probeValidateFns = new Map<Probe, ProbeValidationCallback[]>();
  #probeCtx = new Map<Probe, ProbeContext>();
  #probeMainCtx = new Map<Probe, ProbeMainContext>();

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
    dataExfiltration,
    sqlInjection,
    isMonkeyPatch,
    isPrototypePollution
  ];

  static Optionals: Record<OptionalWarningName, Probe> = {
    "synchronous-io": isSyncIO,
    "log-usage": logUsage,
    "insecure-random": isRandom,
    "weak-scrypt": isWeakScrypt,
    "weak-argon2": isWeakArgon2
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
        typeof probe.main === "function" || typeof probe.main === "object",
        `Invalid probe ${probe.name}: main must be a function or an object with named handlers`
      );
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

      // Pre-build per-probe caches before calling initialize so #getProbeContext can use them.
      const setEntryPoint = (handlerName: string) => {
        if (typeof probe.main === "object") {
          this.#selectedEntryPoints.set(probe, handlerName);
        }
      };
      const ctx: ProbeContext = {
        sourceFile: this.sourceFile,
        context: probe.context,
        setEntryPoint
      };
      const mainCtx: ProbeMainContext = {
        sourceFile: this.sourceFile,
        context: probe.context,
        setEntryPoint,
        signals: ProbeRunner.Signals,
        data: null
      };
      this.#probeCtx.set(probe, ctx);
      this.#probeMainCtx.set(probe, mainCtx);
      this.#probeValidateFns.set(
        probe,
        Array.isArray(probe.validateNode) ? probe.validateNode : [probe.validateNode]
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

        // Pass a fresh object for initialize so any captured reference reflects
        // the state at call-time (probe.context is undefined before initialize returns).
        const context = probe.initialize({
          sourceFile: this.sourceFile,
          context: probe.context,
          setEntryPoint
        });
        if (context) {
          probe.context = structuredClone(context);
          ctx.context = probe.context;
          mainCtx.context = probe.context;
        }
      }
    }

    this.probes = probes;
  }

  #getProbeContext(
    probe: Probe
  ): ProbeContext {
    const ctx = this.#probeCtx.get(probe)!;
    ctx.context = probe.context;

    return ctx;
  }

  #getProbeHandler(
    probe: Probe
  ): (node: any, ctx: ProbeMainContext) => ProbeReturn {
    if (typeof probe.main === "function") {
      return probe.main;
    }

    const selectedName = this.#selectedEntryPoints.get(probe);
    const handlerName = (selectedName && selectedName in probe.main)
      ? selectedName
      : "default";

    return probe.main[handlerName];
  }

  #runProbe(
    probe: Probe,
    node: ESTree.Node
  ): ProbeReturn {
    const validationFns = this.#probeValidateFns.get(probe)!;
    const ctx = this.#getProbeContext(probe);

    for (const validateNode of validationFns) {
      const [isMatching, data = null] = validateNode(
        node,
        ctx
      );
      if (!isMatching) {
        continue;
      }

      const mainHandler = this.#getProbeHandler(probe);
      this.#selectedEntryPoints.delete(probe);

      const mainCtx = this.#probeMainCtx.get(probe)!;
      mainCtx.context = probe.context;
      mainCtx.data = data;

      return mainHandler(node, mainCtx);
    }

    return null;
  }

  walk(
    node: ESTree.Node
  ): null | "skip" {
    this.#breakGroups.clear();

    let tracedIdentifierReport: TracedIdentifierReport | null | undefined;
    let tracedIdentifier: string | null | undefined;

    if (node.type === "CallExpression") {
      const id = getCallExpressionIdentifier(node, {
        externalIdentifierLookup: (name) => this.sourceFile.tracer.literalIdentifiers.get(name)?.value ?? null
      });
      if (id !== null) {
        tracedIdentifierReport = this.sourceFile.tracer.getDataFromIdentifier(id);
        tracedIdentifier = id;
      }
    }

    for (const probe of this.probes) {
      if (probe.breakGroup && this.#breakGroups.has(probe.breakGroup)) {
        continue;
      }

      try {
        if (probe.context && tracedIdentifierReport) {
          probe.context[CALL_EXPRESSION_IDENTIFIER] = tracedIdentifier;
          probe.context[CALL_EXPRESSION_DATA] = tracedIdentifierReport;
        }

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
            this.#breakGroups.add(breakGroup);
          }
        }
      }
      finally {
        probe.teardown?.(this.#getProbeContext(probe));
        if (probe.context) {
          delete probe.context[CALL_EXPRESSION_DATA];
          delete probe.context[CALL_EXPRESSION_IDENTIFIER];
        }
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

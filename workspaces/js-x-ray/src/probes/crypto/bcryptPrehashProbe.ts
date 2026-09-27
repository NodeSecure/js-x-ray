// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type {
  Probe,
  ProbeContext,
  ProbeMainContext
} from "../../ProbeRunner.ts";
import { isFunctionNode } from "../../estree/types.ts";
import { getParamNames } from "../../estree/index.ts";
import type { WarningName } from "../../warnings.ts";
import {
  VariableTracer,
  type ReturnValueEventPayload
} from "../../VariableTracer.ts";
import { hasImportedModules, matchTracedCall, traceAll } from "../tracing.ts";

// CONSTANTS
const kModuleName = "bcryptjs";
const kTracedFunctions = new Set([
  `${kModuleName}.hash`,
  `${kModuleName}.hashSync`
]);

const kFlaggedVariables = Symbol("flaggedVariables");
const kAmbiguousVariableNames = Symbol("ambiguousVariableNames");

export interface BcryptPrehashContext {
  [kFlaggedVariables]?: Set<string>;
  [kAmbiguousVariableNames]?: Set<string>;
}

export interface BcryptArgumentInspector {
  tracer: VariableTracer;
  /**
   * Whether the given variable holds a digest flagged by this probe and is not
   * shadowed by a function parameter, which would make its origin ambiguous.
   */
  isFlaggedIdentifier: (name: string) => boolean;
}

export interface BcryptPrehashProbeOptions {
  name: string;
  warningKind: WarningName;
  /**
   * Traced crypto digest chains whose return value may end up being hashed.
   */
  digestChains: readonly string[];
  /**
   * Whether the value returned by one of the `digestChains` must be flagged.
   */
  shouldFlagReturnValue: (
    payload: ReturnValueEventPayload,
    tracer: VariableTracer
  ) => boolean;
  /**
   * Verdict on the value handed over to bcrypt.hash()
   */
  isUnsafeArgument: (
    argument: ESTree.Node | undefined,
    inspector: BcryptArgumentInspector
  ) => boolean;
}

type NodeValidationResult = [false] | [true] | [true, string[]];

function getContextSet(
  ctx: ProbeContext<BcryptPrehashContext>,
  key: typeof kFlaggedVariables | typeof kAmbiguousVariableNames
): Set<string> {
  return ctx.context![key]!;
}

/**
 * @description
 * Both bcrypt pre-hashing probes run the same machinery: flag the variables
 * holding a crypto digest, ignore the ones shadowed by a function parameter of
 * the same name, then rule on the value passed to bcrypt.hash(). Only what
 * counts as a suspicious digest differs between them.
 */
export function createBcryptPrehashProbe(
  options: BcryptPrehashProbeOptions
): Probe<BcryptPrehashContext> {
  const {
    name,
    warningKind,
    digestChains,
    shouldFlagReturnValue,
    isUnsafeArgument
  } = options;

  function validateNode(
    node: ESTree.Node,
    ctx: ProbeContext<BcryptPrehashContext>
  ): NodeValidationResult {
    if (!hasImportedModules(ctx, kModuleName, "crypto")) {
      return [false];
    }

    // A parameter shadowing a flagged variable makes every later use of that
    // name ambiguous, so the function is walked to collect its parameters.
    if (isFunctionNode(node)) {
      const paramNames = getParamNames(node.params);
      const flaggedVariables = getContextSet(ctx, kFlaggedVariables);

      if (paramNames.some((paramName) => flaggedVariables.has(paramName))) {
        ctx.setEntryPoint("markAmbiguousParams");

        return [true, paramNames];
      }

      return [false];
    }

    const [isMatching] = matchTracedCall(ctx, kTracedFunctions);

    return [isMatching];
  }

  function initialize(
    ctx: ProbeContext<BcryptPrehashContext>
  ) {
    const { tracer } = ctx.sourceFile;

    ctx.context![kFlaggedVariables] = new Set<string>();
    ctx.context![kAmbiguousVariableNames] = new Set<string>();

    traceAll(tracer, kTracedFunctions, { moduleName: kModuleName });
    traceAll(tracer, digestChains, {
      followReturnValueAssignement: true,
      moduleName: "crypto"
    });

    tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
      if (!digestChains.includes(payload.identifierOrMemberExpr)) {
        return;
      }

      if (shouldFlagReturnValue(payload, tracer)) {
        getContextSet(ctx, kFlaggedVariables).add(payload.id);
      }
    });
  }

  function markAmbiguousParams(
    _node: ESTree.Node,
    ctx: ProbeMainContext<BcryptPrehashContext>
  ) {
    const ambiguousVariableNames = getContextSet(ctx, kAmbiguousVariableNames);
    for (const paramName of ctx.data as string[]) {
      ambiguousVariableNames.add(paramName);
    }
  }

  function bcryptHashCall(
    bcryptNode: ESTree.CallExpression,
    ctx: ProbeMainContext<BcryptPrehashContext>
  ) {
    const { sourceFile } = ctx;
    const inspector: BcryptArgumentInspector = {
      tracer: sourceFile.tracer,
      isFlaggedIdentifier: (identifierName) => (
        !getContextSet(ctx, kAmbiguousVariableNames).has(identifierName) &&
        getContextSet(ctx, kFlaggedVariables).has(identifierName)
      )
    };

    if (isUnsafeArgument(bcryptNode.arguments.at(0), inspector)) {
      sourceFile.addWarning(warningKind, {
        value: null,
        location: bcryptNode.loc
      });
    }
  }

  return {
    name,
    nodeTypes: [
      "CallExpression",
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowFunctionExpression"
    ],
    validateNode,
    main: {
      default: bcryptHashCall,
      markAmbiguousParams
    },
    initialize,
    breakOnMatch: false,
    context: {}
  };
}

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../../contants.ts";
import { isFunctionNode, isIdentifier, isCallExpression } from "../../estree/types.ts";
import { getParamNames } from "../../estree/index.ts";
import { generateWarning } from "../../warnings.ts";
import {
  VariableTracer,
  type LiteralIdentifier,
  type ReturnValueEventPayload
} from "../../VariableTracer.ts";
import { resolveStringValue } from "./resolveStringValue.ts";
import { resolveDigestCall } from "./resolveDigestCall.ts";

const kModuleName = "bcryptjs";
const kTracedFunctions = new Set(["bcryptjs.hash", "bcryptjs.hashSync"]);

const kUnsafeDigestVariables = Symbol("unsafeDigestVariables");
const kAmbiguousVariableNames = Symbol("ambiguousVariableNames");

interface UnsafePrehashContext {
  [kUnsafeDigestVariables]?: Set<string>;
  [kAmbiguousVariableNames]?: Set<string>;
}

type UnsafePrehashContextSetKey =
  | typeof kUnsafeDigestVariables
  | typeof kAmbiguousVariableNames;

function getContextSet(
  ctx: ProbeContext<UnsafePrehashContext>,
  key: UnsafePrehashContextSetKey
): Set<string> {
  return ctx.context![key]!;
}

/**
 * Digest encodings that produce ASCII-only output, avoiding the null-byte truncation issue
 */
const kSafeDigestEncodings = new Set(["base64", "base64url", "hex"]);

const kDigestChains = [
  "crypto.createHash.update.digest",
  "crypto.createHash.update.digest.toString",
  "crypto.createHash.digest",
  "crypto.createHash.digest.toString",
  "crypto.createHmac.update.digest",
  "crypto.createHmac.update.digest.toString",
  "crypto.createHmac.digest",
  "crypto.createHmac.digest.toString"
] as const;

function isSafeEncodingArg(
  node: ESTree.Node | undefined,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean {
  const value = resolveStringValue(node, literalIdentifiers);

  return value !== null && kSafeDigestEncodings.has(value);
}

function hasUnsafeDigestEncoding(
  hashNode: ESTree.Node | null | undefined,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean {
  const encodingArgs = resolveDigestCall(hashNode)?.encodingArguments;
  if (encodingArgs === undefined) {
    return false;
  }

  return !isSafeEncodingArg(encodingArgs.at(0), literalIdentifiers);
}

type NodeValidationResult =
  [false] |
  [true] |
  [true, string[]];

function validateNode(
  node: ESTree.Node,
  ctx: ProbeContext<UnsafePrehashContext>
): NodeValidationResult {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has(kModuleName) || !tracer.importedModules.has("crypto")) {
    return [false];
  }

  if (isFunctionNode(node)) {
    const paramNames = getParamNames(node.params);
    const unsafeVars = getContextSet(ctx, kUnsafeDigestVariables);

    if (paramNames.some((name) => unsafeVars.has(name))) {
      ctx.setEntryPoint("markAmbiguousParams");

      return [true, paramNames];
    }

    return [false];
  }

  return [
    kTracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(ctx: ProbeContext<UnsafePrehashContext>) {
  const { tracer } = ctx.sourceFile;

  ctx.context![kUnsafeDigestVariables] = new Set<string>();
  ctx.context![kAmbiguousVariableNames] = new Set<string>();

  for (const identifierOrMemberExpr of kTracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: kModuleName
    });
  }

  for (const chain of kDigestChains) {
    tracer.trace(chain, {
      followReturnValueAssignement: true,
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!(kDigestChains as readonly string[]).includes(payload.identifierOrMemberExpr)) {
      return;
    }

    const encodingArg = resolveDigestCall(payload.node)?.encodingArguments.at(0);
    if (!isSafeEncodingArg(encodingArg, tracer.literalIdentifiers)) {
      ctx.context![kUnsafeDigestVariables]!.add(payload.id);
    }
  });
}

function markAmbiguousParams(
  _node: ESTree.Node,
  ctx: ProbeMainContext<UnsafePrehashContext>
) {
  const ambiguousVariableNames = getContextSet(ctx, kAmbiguousVariableNames);
  for (const name of ctx.data as string[]) {
    ambiguousVariableNames.add(name);
  }
}

function bcryptHashCall(
  bcryptNode: ESTree.CallExpression,
  ctx: ProbeMainContext<UnsafePrehashContext>
) {
  const { sourceFile } = ctx;
  const hashArgument = bcryptNode.arguments.at(0);

  let isUnsafe: boolean;
  if (isIdentifier(hashArgument)) {
    const isAmbiguous = getContextSet(ctx, kAmbiguousVariableNames).has(hashArgument.name);
    const isDigestVariable = getContextSet(ctx, kUnsafeDigestVariables).has(hashArgument.name);

    isUnsafe = !isAmbiguous && isDigestVariable;
  }
  else if (
    isCallExpression(hashArgument) &&
    isIdentifier(hashArgument.callee) &&
    !getContextSet(ctx, kAmbiguousVariableNames).has(hashArgument.callee.name) &&
    getContextSet(ctx, kUnsafeDigestVariables).has(hashArgument.callee.name)
  ) {
    const encodingArg = hashArgument.arguments.at(0);
    isUnsafe = !isSafeEncodingArg(encodingArg, sourceFile.tracer.literalIdentifiers);
  }
  else {
    isUnsafe = hasUnsafeDigestEncoding(hashArgument, sourceFile.tracer.literalIdentifiers);
  }

  if (isUnsafe) {
    sourceFile.warnings.push(
      generateWarning("crypto.unsafe-prehash", {
        value: null,
        location: bcryptNode.loc
      })
    );
  }
}

export default {
  name: "isUnsafePrehash",
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

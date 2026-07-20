// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { isLiteral, isFunctionNode, isIdentifier, isCallExpression } from "../estree/types.ts";
import { getParamNames, getMemberCallExpression } from "../estree/index.ts";
import { generateWarning } from "../warnings.ts";
import {
  VariableTracer,
  type LiteralIdentifier,
  type ReturnValueEventPayload
} from "../VariableTracer.ts";

const kModuleName = "bcryptjs";
const kTracedFunctions = new Set(["bcryptjs.hash", "bcryptjs.hashSync"]);

const kUnsafeDigestVariables = Symbol("unsafeDigestVariables");
const kAmbiguousVariableNames = Symbol("ambiguousVariableNames");

interface UnsafePrehashContext {
  [kUnsafeDigestVariables]: Set<string>;
  [kAmbiguousVariableNames]: Set<string>;
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

/**
 * Resolves both `x.digest(encoding)` and `x.digest().toString(encoding)`
 */
function resolveDigestEncodingArguments(
  hashNode: ESTree.Node | null | undefined
): ESTree.Node[] | null {
  const digestCall = getMemberCallExpression(hashNode, "digest");
  if (digestCall) {
    return digestCall.arguments;
  }

  const toStringCall = getMemberCallExpression(hashNode, "toString");
  if (toStringCall) {
    const innerDigestCall = getMemberCallExpression(toStringCall.callee.object, "digest");
    if (innerDigestCall) {
      return innerDigestCall.arguments.length === 0
        ? toStringCall.arguments
        : innerDigestCall.arguments;
    }
  }

  return null;
}

function isSafeEncodingArg(
  node: ESTree.Node | undefined,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean {
  if (isLiteral(node)) {
    return kSafeDigestEncodings.has(node.value);
  }

  if (isIdentifier(node)) {
    const literal = literalIdentifiers.get(node.name);

    return literal !== undefined && kSafeDigestEncodings.has(literal.value);
  }

  return false;
}

function hasUnsafeDigestEncoding(
  hashNode: ESTree.Node | null | undefined,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean {
  const encodingArgs = resolveDigestEncodingArguments(hashNode);
  if (encodingArgs === null) {
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
    const hasUnsafeDigestVar = paramNames.some((name) => ctx.context![kUnsafeDigestVariables].has(name));

    if (hasUnsafeDigestVar) {
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

    const encodingArg = payload.arguments.at(0);
    if (!isSafeEncodingArg(encodingArg, tracer.literalIdentifiers)) {
      ctx.context![kUnsafeDigestVariables].add(payload.id);
    }
  });
}

function markAmbiguousParams(
  _node: ESTree.Node,
  ctx: ProbeMainContext<UnsafePrehashContext, string[]>
) {
  for (const name of ctx.data) {
    ctx.context![kAmbiguousVariableNames].add(name);
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
    const isAmbiguous = ctx.context![kAmbiguousVariableNames].has(hashArgument.name);
    const isDigestVariable = ctx.context![kUnsafeDigestVariables].has(hashArgument.name);

    isUnsafe = !isAmbiguous && isDigestVariable;
  }
  else if (
    isCallExpression(hashArgument) &&
    isIdentifier(hashArgument.callee) &&
    !ctx.context![kAmbiguousVariableNames].has(hashArgument.callee.name) &&
    ctx.context![kUnsafeDigestVariables].has(hashArgument.callee.name)
  ) {
    const encodingArg = hashArgument.arguments.at(0);
    isUnsafe = !isSafeEncodingArg(encodingArg, sourceFile.tracer.literalIdentifiers);
  }
  else {
    isUnsafe = hasUnsafeDigestEncoding(hashArgument, sourceFile.tracer.literalIdentifiers);
  }

  if (isUnsafe) {
    sourceFile.warnings.push(
      generateWarning("unsafe-prehash", {
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
  context: {} as UnsafePrehashContext
};

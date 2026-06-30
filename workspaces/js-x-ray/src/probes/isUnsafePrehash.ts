// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { isLiteral } from "../estree/types.ts";
import { getVariableDeclarationIdentifiers, getMemberCallExpression } from "../estree/index.ts";
import { generateWarning } from "../warnings.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";

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

function getParamNames(
  params: ESTree.Node[]
): string[] {
  const names: string[] = [];

  for (const param of params) {
    for (const { assignmentId } of getVariableDeclarationIdentifiers(param)) {
      names.push(assignmentId.name);
    }
  }

  return names;
}

function hasUnsafeDigestEncoding(
  hashNode: ESTree.Node | null | undefined
): boolean {
  const encodingArgs = resolveDigestEncodingArguments(hashNode);
  if (encodingArgs === null) {
    return false;
  }

  const encodingArg = encodingArgs.at(0);

  return !(isLiteral(encodingArg) && kSafeDigestEncodings.has(encodingArg.value));
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
      moduleName: "crypto"
    });
  }

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!(kDigestChains as readonly string[]).includes(payload.identifierOrMemberExpr)) {
      return;
    }

    const encodingArg = payload.arguments.at(0);
    const isSafe = isLiteral(encodingArg) && kSafeDigestEncodings.has(encodingArg.value);
    if (!isSafe) {
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
  if (hashArgument?.type === "Identifier") {
    const isAmbiguous = getContextSet(ctx, kAmbiguousVariableNames).has(hashArgument.name);
    const isDigestVariable = getContextSet(ctx, kUnsafeDigestVariables).has(hashArgument.name);

    isUnsafe = !isAmbiguous && isDigestVariable;
  }
  else if (
    hashArgument?.type === "CallExpression" &&
    hashArgument.callee.type === "Identifier" &&
    !getContextSet(ctx, kAmbiguousVariableNames).has(hashArgument.callee.name) &&
    getContextSet(ctx, kUnsafeDigestVariables).has(hashArgument.callee.name)
  ) {
    const encodingArg = hashArgument.arguments.at(0);
    isUnsafe = !(isLiteral(encodingArg) && kSafeDigestEncodings.has(encodingArg.value));
  }
  else {
    isUnsafe = hasUnsafeDigestEncoding(hashArgument);
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
  context: {}
};

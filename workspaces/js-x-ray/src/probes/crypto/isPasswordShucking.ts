// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../../contants.ts";
import { isCallExpression, isFunctionNode, isIdentifier, isMemberExpression } from "../../estree/types.ts";
import { getParamNames, getMemberCallExpression } from "../../estree/index.ts";
import { generateWarning } from "../../warnings.ts";
import {
  VariableTracer,
  type ReturnValueEventPayload
} from "../../VariableTracer.ts";

const kModuleName = "bcryptjs";
const kTracedFunctions = new Set(["bcryptjs.hash", "bcryptjs.hashSync"]);

const kShuckingVariables = Symbol("shuckingVariables");
const kAmbiguousVariableNames = Symbol("ambiguousVariableNames");

interface PasswordShuckingContext {
  [kShuckingVariables]?: Set<string>;
  [kAmbiguousVariableNames]?: Set<string>;
}

/**
 * createHmac is intentionally excluded, HMAC with a pepper is the OWASP-safe pattern.
 */
const kHashDigestChains = [
  "crypto.createHash.update.digest",
  "crypto.createHash.update.digest.toString",
  "crypto.createHash.digest",
  "crypto.createHash.digest.toString"
] as const;

function isCreateHashChain(node: ESTree.Node | null | undefined): boolean {
  let current = node;
  while (isCallExpression(current)) {
    const { callee } = current;
    if (!isMemberExpression(callee)) {
      break;
    }
    if (isIdentifier(callee.property) && callee.property.name === "createHash") {
      return true;
    }
    current = callee.object;
  }

  return false;
}

function hasDigestChain(hashNode: ESTree.Node | null | undefined): boolean {
  if (getMemberCallExpression(hashNode, "digest") !== null) {
    return true;
  }
  const toStringCall = getMemberCallExpression(hashNode, "toString");
  if (toStringCall) {
    return getMemberCallExpression(toStringCall.callee.object, "digest") !== null;
  }

  return false;
}

function isShuckingPrehash(hashNode: ESTree.Node | null | undefined): boolean {
  return hasDigestChain(hashNode) && isCreateHashChain(hashNode);
}

type NodeValidationResult = [false] | [true] | [true, string[]];

function validateNode(
  node: ESTree.Node,
  ctx: ProbeContext<PasswordShuckingContext>
): NodeValidationResult {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has(kModuleName) || !tracer.importedModules.has("crypto")) {
    return [false];
  }

  if (isFunctionNode(node)) {
    const paramNames = getParamNames(node.params);
    const shuckingVars = ctx.context![kShuckingVariables]!;

    if (paramNames.some((name) => shuckingVars.has(name))) {
      ctx.setEntryPoint("markAmbiguousParams");

      return [true, paramNames];
    }

    return [false];
  }

  return [kTracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)];
}

function initialize(ctx: ProbeContext<PasswordShuckingContext>) {
  const { tracer } = ctx.sourceFile;

  ctx.context![kShuckingVariables] = new Set<string>();
  ctx.context![kAmbiguousVariableNames] = new Set<string>();

  for (const fn of kTracedFunctions) {
    tracer.trace(fn, {
      followConsecutiveAssignment: true,
      moduleName: kModuleName
    });
  }

  for (const chain of kHashDigestChains) {
    tracer.trace(chain, {
      followReturnValueAssignement: true,
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!(kHashDigestChains as readonly string[]).includes(payload.identifierOrMemberExpr)) {
      return;
    }

    ctx.context![kShuckingVariables]!.add(payload.id);
  });
}

function markAmbiguousParams(
  _node: ESTree.Node,
  ctx: ProbeMainContext<PasswordShuckingContext>
) {
  for (const name of ctx.data as string[]) {
    ctx.context![kAmbiguousVariableNames]!.add(name);
  }
}

function bcryptHashCall(
  bcryptNode: ESTree.CallExpression,
  ctx: ProbeMainContext<PasswordShuckingContext>
) {
  const hashArgument = bcryptNode.arguments.at(0);
  const ambiguousVars = ctx.context![kAmbiguousVariableNames]!;
  const shuckingVars = ctx.context![kShuckingVariables]!;

  const isVariableShucking = isIdentifier(hashArgument) &&
    !ambiguousVars.has(hashArgument.name) &&
    shuckingVars.has(hashArgument.name);

  if (isVariableShucking || isShuckingPrehash(hashArgument)) {
    ctx.sourceFile.warnings.push(
      generateWarning("crypto.password-shucking", {
        value: null,
        location: bcryptNode.loc
      })
    );
  }
}

export default {
  name: "isPasswordShucking",
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

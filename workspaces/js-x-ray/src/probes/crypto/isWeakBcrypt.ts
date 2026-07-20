// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../../contants.ts";
import { isStringLiteral, isNumericLiteral, isIdentifier } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";

const kMinRounds = 10;

const kModuleName = "bcryptjs";

// Maps a traced bcrypt function name to the argument index
const kTracedFunctionsWithArgIndex = new Map([
  ["hash", 1],
  ["hashSync", 1],
  ["genSalt", 0],
  ["genSaltSync", 0]
]);

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has(kModuleName)) {
    return [false];
  }

  const identifierOrMemberExpr = ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;
  if (!identifierOrMemberExpr) {
    return [false];
  }

  const [, functionName] = identifierOrMemberExpr.split(".");

  return [kTracedFunctionsWithArgIndex.has(functionName), functionName];
}

function initialize(ctx: ProbeContext) {
  const { tracer } = ctx.sourceFile;

  for (const functionName of kTracedFunctionsWithArgIndex.keys()) {
    tracer.trace(`${kModuleName}.${functionName}`, {
      followConsecutiveAssignment: true,
      moduleName: kModuleName
    });
  }
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile } = ctx;
  const { tracer } = sourceFile;
  const argIndex = kTracedFunctionsWithArgIndex.get(ctx.data as string)!;
  const arg = node.arguments.at(argIndex);

  if (isNumericLiteral(arg)) {
    if (arg.value < kMinRounds) {
      sourceFile.warnings.push(
        generateWarning("crypto.weak-bcrypt", {
          value: "low-work-factor",
          location: node.loc
        })
      );
    }
  }
  else if (isIdentifier(arg)) {
    const literal = tracer.literalIdentifiers.get(arg.name);
    const numValue = Number(literal?.value);
    if (!Number.isNaN(numValue) && numValue < kMinRounds) {
      sourceFile.warnings.push(
        generateWarning("crypto.weak-bcrypt", {
          value: "low-work-factor",
          location: node.loc
        })
      );
    }
  }
  else if (isStringLiteral(arg)) {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-bcrypt", {
        value: "hardcoded-salt",
        location: node.loc
      })
    );
  }
}

export default {
  name: "isWeakBcrypt",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};

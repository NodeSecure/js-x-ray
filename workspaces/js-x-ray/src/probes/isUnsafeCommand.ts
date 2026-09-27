// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { literalToString } from "../estree/index.ts";
import type {
  ProbeMainContext,
  ProbeContext
} from "../ProbeRunner.ts";
import {
  isStringLiteral,
  isTemplateLiteral
} from "../estree/types.ts";
import { matchTracedCall, moduleNameOf, traceAll } from "./tracing.ts";

// CONSTANTS
const kUnsafeCommands = ["csrutil", "uname", "ping", "curl"];

// CONSTANTS
const kTracedFunctions = new Set([
  "child_process.spawn",
  "child_process.spawnSync",
  "child_process.exec",
  "child_process.execSync"
]);

function isUnsafeCommand(
  command: string
): boolean {
  return kUnsafeCommands.some((unsafeCommand) => command.includes(unsafeCommand));
}

function concatArrayArgs(
  command: string,
  node: ESTree.CallExpression
): string {
  const arrExpr = node.arguments.at(1);
  let finalizedCommand = command;

  if (arrExpr && arrExpr.type === "ArrayExpression") {
    arrExpr.elements
      .filter((element) => isStringLiteral(element))
      .forEach((element) => {
        finalizedCommand += ` ${element.value}`;
      });
  }

  return finalizedCommand;
}

/**
 * @description Detect spawn or exec unsafe commands
 * @example
 * child_process.spawn("csrutil", ["status"]);
 *
 * require("child_process").spawn("csrutil", ["disable"]);
 *
 * const { exec } = require("child_process");
 * exec("csrutil status");
 */
function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const [isMatching, identifierOrMemberExpr] = matchTracedCall(ctx, kTracedFunctions);

  return isMatching ?
    [true, identifierOrMemberExpr!.slice("child_process.".length)] :
    [false];
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile, data: methodName, signals } = ctx;

  const commandArg = node.arguments[0];
  if (!isStringLiteral(commandArg) && !isTemplateLiteral(commandArg)) {
    return null;
  }

  const command = literalToString(commandArg);

  // Aggressive mode warns on any child_process usage, conservative mode only
  // on the commands we know to be suspicious.
  if (sourceFile.sensitivity !== "aggressive" && !isUnsafeCommand(command)) {
    return null;
  }

  // Spawned command arguments are filled into an Array
  // as second arguments. This is why we should add them
  // manually to the command string.
  const reportedCommand = methodName === "spawn" || methodName === "spawnSync" ?
    concatArrayArgs(command, node) :
    command;

  sourceFile.addWarning("unsafe-command", {
    value: reportedCommand,
    location: node.loc
  });

  return signals.Skip;
}

function initialize(
  ctx: ProbeContext
) {
  traceAll(ctx.sourceFile.tracer, kTracedFunctions, { moduleName: moduleNameOf });
}

export default {
  name: "isUnsafeCommand",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  context: {}
};

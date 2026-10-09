// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { literalToString } from "../estree/index.ts";
import type {
  ProbeMainContext,
  ProbeContext
} from "../ProbeRunner.ts";
import { defineProbe } from "../defineProbe.ts";
import {
  isStringLiteral,
  isTemplateLiteral
} from "../estree/types.ts";
import { generateWarning } from "../warnings.ts";
import { matchTracedCall, traceAllFromModule, type ModuleScopedIdentifier } from "./tracing.ts";

// CONSTANTS
const kUnsafeCommands = ["csrutil", "uname", "ping", "curl"];
const kSpawnFunctions = new Set<ModuleScopedIdentifier>([
  "child_process.spawn",
  "child_process.spawnSync"
]);
const kTracedFunctions = new Set<ModuleScopedIdentifier>([
  ...kSpawnFunctions,
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
  _node: ESTree.CallExpression,
  ctx: ProbeContext
): [boolean, any?] {
  return matchTracedCall(ctx, kTracedFunctions);
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile, data: tracedFunction, signals } = ctx;

  const commandArg = node.arguments[0];
  if (!isStringLiteral(commandArg) && !isTemplateLiteral(commandArg)) {
    return null;
  }

  let command = literalToString(commandArg);

  // Aggressive mode: warn on any child_process usage
  if (sourceFile.sensitivity === "aggressive") {
    // Handle spawn/spawnSync array arguments
    if (kSpawnFunctions.has(tracedFunction)) {
      command = concatArrayArgs(command, node);
    }

    const warning = generateWarning("unsafe-command", {
      value: command,
      location: node.loc
    });
    sourceFile.warnings.push(warning);

    return signals.Skip;
  }

  // Conservative mode: existing strict validation
  if (isUnsafeCommand(command)) {
    // Spawned command arguments are filled into an Array
    // as second arguments. This is why we should add them
    // manually to the command string.
    if (kSpawnFunctions.has(tracedFunction)) {
      command = concatArrayArgs(command, node);
    }

    const warning = generateWarning("unsafe-command", {
      value: command,
      location: node.loc
    });
    sourceFile.warnings.push(warning);

    return signals.Skip;
  }

  return null;
}

function initialize(
  ctx: ProbeContext
) {
  traceAllFromModule(ctx.sourceFile.tracer, kTracedFunctions);
}

export default defineProbe({
  name: "isUnsafeCommand",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  context: {}
});

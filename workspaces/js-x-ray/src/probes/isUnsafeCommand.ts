// Import Third-party Dependencies
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type {
  ProbeMainContext,
  ProbeContext
} from "../ProbeRunner.ts";
import {
  isLiteral,
  isTemplateLiteral
} from "../types/estree.ts";
import { generateWarning } from "../warnings.ts";
import { toLiteral } from "../utils/toLiteral.ts";

// CONSTANTS
const kUnsafeCommands = ["csrutil", "uname", "ping", "curl"];

// CONSTANTS
const kIdentifierOrMemberExps = [
  "child_process.spawn",
  "child_process.spawnSync",
  "child_process.exec",
  "child_process.execSync"
];

function isUnsafeCommand(
  command: string
): boolean {
  return kUnsafeCommands.some((unsafeCommand) => command.includes(unsafeCommand));
}

function getCommand(commandArg: ESTree.Literal | ESTree.TemplateLiteral): string {
  let command = "";
  switch (commandArg.type) {
    case "Literal":
      command = commandArg.value as string;
      break;
    case "TemplateLiteral":
      command = toLiteral(commandArg);
      break;
  }

  return command;
}

function concatArrayArgs(
  command: string,
  node: ESTree.CallExpression
): string {
  const arrExpr = node.arguments.at(1);
  let finalizedCommand = command;

  if (arrExpr && arrExpr.type === "ArrayExpression") {
    arrExpr.elements
      .filter((element) => isLiteral(element))
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
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  const id = getCallExpressionIdentifier(
    node,
    {
      externalIdentifierLookup: (name) => tracer.literalIdentifiers.get(name) ?? null
    }
  );
  if (
    id === null
  ) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return data && kIdentifierOrMemberExps.includes(data.name) ? [
    true,
    data.name.slice("child_process.".length)
  ] : [false];
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile, data: methodName, signals } = ctx;

  const commandArg = node.arguments[0];
  if (!isLiteral(commandArg) && !isTemplateLiteral(commandArg)) {
    return null;
  }

  let command = getCommand(commandArg);

  // Aggressive mode: warn on any child_process usage
  if (sourceFile.sensitivity === "aggressive") {
    // Handle spawn/spawnSync array arguments
    if (methodName === "spawn" || methodName === "spawnSync") {
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
    if (methodName === "spawn" || methodName === "spawnSync") {
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
  kIdentifierOrMemberExps.forEach((identifierOrMemberExp) => {
    const moduleName = identifierOrMemberExp.split(".")[0];

    ctx.sourceFile.tracer.trace(identifierOrMemberExp, {
      followConsecutiveAssignment: true,
      moduleName
    });
  });
}

export default {
  name: "isUnsafeCommand",
  validateNode,
  main,
  initialize
};

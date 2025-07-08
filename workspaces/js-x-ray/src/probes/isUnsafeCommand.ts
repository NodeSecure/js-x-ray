// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { generateWarning } from "../warnings.js";
import { ProbeSignals } from "../ProbeRunner.js";
import { isLiteral, isTemplateLiteral } from "../types/estree.js";

// CONSTANTS
const kUnsafeCommands = ["csrutil", "uname", "ping", "curl"];

function isUnsafeCommand(
  command: string
): boolean {
  return kUnsafeCommands.some((unsafeCommand) => command.includes(unsafeCommand));
}

function isSpawnOrExec(
  name: string
): boolean {
  return name === "spawn" ||
    name === "exec" ||
    name === "spawnSync" ||
    name === "execSync";
}

function getCommand(commandArg: ESTree.Literal | ESTree.TemplateLiteral) {
  switch (commandArg.type) {
    case "Literal":
      return commandArg.value;
    case "TemplateLiteral":
      return commandArg.quasis.at(0).value.raw;
  }

  return null;
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
  node: ESTree.Node
): [boolean, any?] {
  if (node.type !== "CallExpression" || node.arguments.length === 0) {
    return [false];
  }

  // const { spawn } = require("child_process");
  // spawn("...", ["..."]);
  // or
  // const { exec } = require("child_process");
  // exec(...);
  if (node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    isSpawnOrExec(node.callee.name)
  ) {
    return [true, node.callee.name];
  }

  // child_process.spawn(...) or require("child_process").spawn(...)
  // child_process.exec(...) or require("child_process").exec(...)
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.property.type === "Identifier" &&
    isSpawnOrExec(node.callee.property.name)
  ) {
    // child_process.spawn(...)
    // child_process.exec(...)
    if (
      node.callee.object.type === "Identifier" &&
      node.callee.object.name === "child_process"
    ) {
      return [true, node.callee.property.name];
    }
    // require("child_process").spawn(...)
    // require("child_process").exec(...)
    if (
      node.callee.object.type === "CallExpression" &&
      node.callee.object.callee.type === "Identifier" &&
      node.callee.object.callee.name === "require" &&
      node.callee.object.arguments.length === 1 &&
      node.callee.object.arguments[0].type === "Literal" &&
      node.callee.object.arguments[0].value === "child_process"
    ) {
      return [true, node.callee.property.name];
    }
  }

  return [false];
}

function main(
  node: ESTree.CallExpression,
  options: { sourceFile: SourceFile; data?: string; }
) {
  const { sourceFile, data: methodName } = options;

  const commandArg = node.arguments[0];
  if (!isLiteral(commandArg) && !isTemplateLiteral(commandArg)) {
    return null;
  }

  let command = getCommand(commandArg);
  if (isUnsafeCommand(command)) {
    // Spawned command arguments are filled into an Array
    // as second arguments. This is why we should add them
    // manually to the command string.
    if (methodName === "spawn" || methodName === "spawnSync") {
      const arrExpr = node.arguments.at(1);

      if (arrExpr && arrExpr.type === "ArrayExpression") {
        arrExpr.elements
          .filter((element) => isLiteral(element))
          .forEach((element) => {
            command += ` ${element.value}`;
          });
      }
    }

    const warning = generateWarning("unsafe-command", {
      value: command,
      location: node.loc
    });
    sourceFile.warnings.push(warning);

    return ProbeSignals.Skip;
  }

  return null;
}

export default {
  name: "isUnsafeCommand",
  validateNode,
  main
};

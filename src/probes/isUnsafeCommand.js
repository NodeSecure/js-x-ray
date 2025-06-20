// Import Internal Dependencies
import { ProbeSignals } from "../ProbeRunner.js";

// CONSTANTS
const kUnsafeCommands = ["csrutil"];

function isUnsafeCommand(command) {
  return kUnsafeCommands.some((unsafeCommand) => command.includes(unsafeCommand));
}

function isSpawnOrExec(name) {
  return name === "spawn" ||
    name === "exec" ||
    name === "spawnSync" ||
    name === "execSync";
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
function validateNode(node) {
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
    isSpwanOrExec(node.callee.name)
  ) {
    return [true, node.callee.name];
  }

  // child_process.spawn(...) or require("child_process").spawn(...)
  // child_process.exec(...) or require("child_process").exec(...)
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.property.type === "Identifier" &&
    isSpwanOrExec(node.callee.property.name)
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

function main(node, options) {
  const { sourceFile } = options;

  const commandArg = node.arguments[0];
  if (!commandArg || commandArg.type !== "Literal") {
    return null;
  }

  let command = commandArg.value;
  if (typeof command === "string" && isUnsafeCommand(command)) {
    // Spawned command arguments are filled into an Array
    // as second arguments. This is why we should add them
    // manually to the command string.
    if (options.data === "spawn" || options.data === "spawnSync") {
      const args = node.arguments.at(1);
      if (args && Array.isArray(args.elements)) {
        args.elements.forEach((element) => {
          command += ` ${element.value}`;
        });
      }
    }

    sourceFile.addWarning("unsafe-command", command, node.loc);

    return ProbeSignals.Skip;
  }

  return null;
}

export default {
  name: "isUnsafeCommand",
  validateNode,
  main
};

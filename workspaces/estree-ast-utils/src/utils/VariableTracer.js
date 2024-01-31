// Import Node.js Dependencies
import { EventEmitter } from "node:events";

// Import Internal Dependencies
import { notNullOrUndefined } from "./notNullOrUndefined.js";
import { isEvilIdentifierPath, isNeutralCallable } from "./isEvilIdentifierPath.js";
import { getSubMemberExpressionSegments } from "./getSubMemberExpressionSegments.js";
import { getMemberExpressionIdentifier } from "../getMemberExpressionIdentifier.js";
import { getCallExpressionIdentifier } from "../getCallExpressionIdentifier.js";
import { getVariableDeclarationIdentifiers } from "../getVariableDeclarationIdentifiers.js";
import { getCallExpressionArguments } from "../getCallExpressionArguments.js";
import { extractLogicalExpression } from "../extractLogicalExpression.js";

// CONSTANTS
const kGlobalIdentifiersToTrace = new Set([
  "global", "globalThis", "root", "GLOBAL", "window"
]);
const kRequirePatterns = new Set([
  "require", "require.resolve", "require.main", "process.mainModule.require"
]);
const kUnsafeGlobalCallExpression = new Set(["eval", "Function"]);

export class VariableTracer extends EventEmitter {
  static AssignmentEvent = Symbol("AssignmentEvent");

  // PUBLIC PROPERTIES
  /** @type {Map<string, string>} */
  literalIdentifiers = new Map();

  /** @type {Set<string>} */
  importedModules = new Set();

  // PRIVATE PROPERTIES
  #traced = new Map();
  #variablesRefToGlobal = new Set();

  /** @type {Set<string>} */
  #neutralCallable = new Set();

  debug() {
    console.log(this.#traced);
  }

  enableDefaultTracing() {
    [...kRequirePatterns]
      .forEach((pattern) => this.trace(pattern, { followConsecutiveAssignment: true, name: "require" }));

    return this
      .trace("eval")
      .trace("Function")
      .trace("atob", { followConsecutiveAssignment: true });
  }

  /**
   *
   * @param {!string} identifierOrMemberExpr
   * @param {object} [options]
   * @param {string} [options.name]
   * @param {string} [options.moduleName=null]
   * @param {boolean} [options.followConsecutiveAssignment=false]
   *
   * @example
   * new VariableTracer()
   *  .trace("require", { followConsecutiveAssignment: true })
   *  .trace("process.mainModule")
   */
  trace(identifierOrMemberExpr, options = {}) {
    const {
      followConsecutiveAssignment = false,
      moduleName = null,
      name = identifierOrMemberExpr
    } = options;

    this.#traced.set(identifierOrMemberExpr, {
      name,
      identifierOrMemberExpr,
      followConsecutiveAssignment,
      assignmentMemory: [],
      moduleName
    });

    if (identifierOrMemberExpr.includes(".")) {
      const exprs = [...getSubMemberExpressionSegments(identifierOrMemberExpr)]
        .filter((expr) => !this.#traced.has(expr));

      for (const expr of exprs) {
        this.trace(expr, {
          followConsecutiveAssignment: true, name, moduleName
        });
      }
    }

    return this;
  }

  /**
   * @param {!string} identifierOrMemberExpr An identifier like "foo" or "foo.bar"
   */
  getDataFromIdentifier(identifierOrMemberExpr) {
    const isMemberExpr = identifierOrMemberExpr.includes(".");
    const isTracingIdentifier = this.#traced.has(identifierOrMemberExpr);

    let finalIdentifier = identifierOrMemberExpr;
    if (isMemberExpr && !isTracingIdentifier) {
      const [segment] = identifierOrMemberExpr.split(".");
      if (this.#traced.has(segment)) {
        const tracedIdentifier = this.#traced.get(segment);
        finalIdentifier = `${tracedIdentifier.identifierOrMemberExpr}${identifierOrMemberExpr.slice(segment.length)}`;
      }

      if (!this.#traced.has(finalIdentifier)) {
        return null;
      }
    }
    else if (!isTracingIdentifier) {
      return null;
    }

    const tracedIdentifier = this.#traced.get(finalIdentifier);
    if (!this.#isTracedIdentifierImportedAsModule(tracedIdentifier)) {
      return null;
    }

    const assignmentMemory = this.#traced.get(tracedIdentifier.name)?.assignmentMemory ?? [];

    return {
      name: tracedIdentifier.name,
      identifierOrMemberExpr: tracedIdentifier.identifierOrMemberExpr,
      assignmentMemory
    };
  }

  #getTracedName(identifierOrMemberExpr) {
    return this.#traced.has(identifierOrMemberExpr) ?
      this.#traced.get(identifierOrMemberExpr).name : null;
  }

  #isTracedIdentifierImportedAsModule(id) {
    return id.moduleName === null || this.importedModules.has(id.moduleName);
  }

  #declareNewAssignment(identifierOrMemberExpr, id) {
    const tracedVariant = this.#traced.get(identifierOrMemberExpr);

    // We return if required module has not been imported
    // It mean the assigment has no relation with the required tracing
    if (!this.#isTracedIdentifierImportedAsModule(tracedVariant)) {
      return;
    }

    const newIdentiferName = id.name;

    const assignmentEventPayload = {
      name: tracedVariant.name,
      identifierOrMemberExpr: tracedVariant.identifierOrMemberExpr,
      id: newIdentiferName,
      location: id.loc
    };
    this.emit(VariableTracer.AssignmentEvent, assignmentEventPayload);
    this.emit(tracedVariant.identifierOrMemberExpr, assignmentEventPayload);

    if (tracedVariant.followConsecutiveAssignment && !this.#traced.has(newIdentiferName)) {
      this.#traced.get(tracedVariant.name).assignmentMemory.push(newIdentiferName);
      this.#traced.set(newIdentiferName, tracedVariant);
    }
  }

  #isGlobalVariableIdentifier(identifierName) {
    return kGlobalIdentifiersToTrace.has(identifierName) ||
      this.#variablesRefToGlobal.has(identifierName);
  }

  /**
   * Search alternative for the given MemberExpression parts
   *
   * @example
   * const { process: aName } = globalThis;
   * const boo = aName.mainModule.require; // alternative: process.mainModule.require
   */
  #searchForMemberExprAlternative(parts = []) {
    return parts.flatMap((identifierName) => {
      if (this.#traced.has(identifierName)) {
        return this.#traced.get(identifierName).identifierOrMemberExpr;
      }

      /**
       * If identifier is global then we can eliminate the value from MemberExpr
       *
       * globalThis.process === process;
       */
      if (this.#isGlobalVariableIdentifier(identifierName)) {
        return [];
      }

      return identifierName;
    });
  }

  #autoTraceId(id, prefix = null) {
    for (const { name, assignmentId } of getVariableDeclarationIdentifiers(id)) {
      const identifierOrMemberExpr = typeof prefix === "string" ? `${prefix}.${name}` : name;

      if (this.#traced.has(identifierOrMemberExpr)) {
        this.#declareNewAssignment(identifierOrMemberExpr, assignmentId);
      }
    }
  }

  #walkImportDeclaration(node) {
    const moduleName = node.source.value;
    if (!this.#traced.has(moduleName)) {
      return;
    }

    this.importedModules.add(moduleName);

    // import * as boo from "crypto";
    if (node.specifiers[0].type === "ImportNamespaceSpecifier") {
      const importNamespaceNode = node.specifiers[0];
      this.#declareNewAssignment(moduleName, importNamespaceNode.local);

      return;
    }

    // import { createHash } from "crypto";
    const importSpecifiers = node.specifiers
      .filter((specifierNode) => specifierNode.type === "ImportSpecifier");
    for (const specifier of importSpecifiers) {
      const fullImportedName = `${moduleName}.${specifier.imported.name}`;

      if (this.#traced.has(fullImportedName)) {
        this.#declareNewAssignment(fullImportedName, specifier.imported);
      }
    }
  }

  #walkRequireCallExpression(node, id) {
    const moduleNameLiteral = node.arguments
      .find((argumentNode) => argumentNode.type === "Literal" && this.#traced.has(argumentNode.value));
    if (!moduleNameLiteral) {
      return;
    }
    this.importedModules.add(moduleNameLiteral.value);

    switch (id.type) {
      case "Identifier":
        this.#declareNewAssignment(moduleNameLiteral.value, id);
        break;
      case "ObjectPattern": {
        this.#autoTraceId(id, moduleNameLiteral.value);

        break;
      }
    }
  }

  #walkVariableDeclarationWithIdentifier(variableDeclaratorNode) {
    const { init } = variableDeclaratorNode;

    switch (init.type) {
      /**
       * var root = freeGlobal || freeSelf || Function('return this')();
       */
      case "LogicalExpression": {
        for (const { node } of extractLogicalExpression(init)) {
          this.#walkVariableDeclarationInitialization(
            variableDeclaratorNode,
            node
          );
        }

        return void 0;
      }

      default:
        return this.#walkVariableDeclarationInitialization(
          variableDeclaratorNode
        );
    }
  }

  #walkVariableDeclarationInitialization(
    variableDeclaratorNode,
    childNode = variableDeclaratorNode.init
  ) {
    const { id } = variableDeclaratorNode;

    switch (childNode.type) {
      // let foo = "10"; <-- "foo" is the key and "10" the value
      case "Literal":
        this.literalIdentifiers.set(id.name, childNode.value);
        break;

      /**
       * const g = eval("this");
       * const g = Function("return this")();
       */
      case "CallExpression": {
        const fullIdentifierPath = getCallExpressionIdentifier(childNode);
        if (fullIdentifierPath === null) {
          break;
        }

        const tracedFullIdentifierName = this.#getTracedName(fullIdentifierPath) ?? fullIdentifierPath;
        const [identifierName] = fullIdentifierPath.split(".");

        // const id = Function.prototype.call.call(require, require, "http");
        if (this.#neutralCallable.has(identifierName) || isEvilIdentifierPath(fullIdentifierPath)) {
          // TODO: make sure we are walking on a require CallExpr here ?
          this.#walkRequireCallExpression(childNode, id);
        }
        else if (kUnsafeGlobalCallExpression.has(identifierName)) {
          this.#variablesRefToGlobal.add(id.name);
        }
        // const foo = require("crypto");
        // const bar = require.call(null, "crypto");
        else if (kRequirePatterns.has(identifierName)) {
          this.#walkRequireCallExpression(childNode, id);
        }
        else if (tracedFullIdentifierName === "atob") {
          const callExprArguments = getCallExpressionArguments(childNode, { tracer: this });
          if (callExprArguments === null) {
            break;
          }

          const callExprArgumentNode = callExprArguments.at(0);
          if (typeof callExprArgumentNode === "string") {
            this.literalIdentifiers.set(
              id.name,
              Buffer.from(callExprArgumentNode, "base64").toString()
            );
          }
        }

        break;
      }

      // const r = require
      case "Identifier": {
        const identifierName = childNode.name;
        if (this.#traced.has(identifierName)) {
          this.#declareNewAssignment(identifierName, id);
        }
        else if (this.#isGlobalVariableIdentifier(identifierName)) {
          this.#variablesRefToGlobal.add(id.name);
        }

        break;
      }

      // process.mainModule and require.resolve
      case "MemberExpression": {
        // Example: ["process", "mainModule"]
        const memberExprParts = [...getMemberExpressionIdentifier(childNode, { tracer: this })];
        const memberExprFullname = memberExprParts.join(".");

        // Function.prototype.call
        if (isNeutralCallable(memberExprFullname)) {
          this.#neutralCallable.add(id.name);
        }
        else if (this.#traced.has(memberExprFullname)) {
          this.#declareNewAssignment(memberExprFullname, id);
        }
        else {
          const alternativeMemberExprParts = this.#searchForMemberExprAlternative(memberExprParts);
          const alternativeMemberExprFullname = alternativeMemberExprParts.join(".");

          if (this.#traced.has(alternativeMemberExprFullname)) {
            this.#declareNewAssignment(alternativeMemberExprFullname, id);
          }
        }

        break;
      }
    }
  }

  #walkVariableDeclarationWithAnythingElse(variableDeclaratorNode) {
    const { init, id } = variableDeclaratorNode;

    switch (init.type) {
      // const { process } = eval("this");
      case "CallExpression": {
        const fullIdentifierPath = getCallExpressionIdentifier(init);
        if (fullIdentifierPath === null) {
          break;
        }
        const [identifierName] = fullIdentifierPath.split(".");

        // const {} = Function.prototype.call.call(require, require, "http");
        if (isEvilIdentifierPath(fullIdentifierPath)) {
          this.#walkRequireCallExpression(init, id);
        }
        else if (kUnsafeGlobalCallExpression.has(identifierName)) {
          this.#autoTraceId(id);
        }
        // const { createHash } = require("crypto");
        else if (kRequirePatterns.has(identifierName)) {
          this.#walkRequireCallExpression(init, id);
        }

        break;
      }

      // const { process } = globalThis;
      case "Identifier": {
        const identifierName = init.name;
        if (this.#isGlobalVariableIdentifier(identifierName)) {
          this.#autoTraceId(id);
        }

        break;
      }
    }
  }

  walk(node) {
    switch (node.type) {
      case "ImportDeclaration": {
        this.#walkImportDeclaration(node);
        break;
      }
      case "VariableDeclaration": {
        for (const variableDeclaratorNode of node.declarations) {
          // var foo; <-- no initialization here.
          if (!notNullOrUndefined(variableDeclaratorNode.init)) {
            continue;
          }

          if (variableDeclaratorNode.id.type === "Identifier") {
            this.#walkVariableDeclarationWithIdentifier(variableDeclaratorNode);
          }
          else {
            this.#walkVariableDeclarationWithAnythingElse(variableDeclaratorNode);
          }
        }
        break;
      }
    }
  }
}

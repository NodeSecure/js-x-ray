// Import Node.js Dependencies
import { EventEmitter } from "node:events";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import {
  getMemberExpressionIdentifier,
  getCallExpressionIdentifier,
  getCallExpressionArguments,
  getVariableDeclarationIdentifiers,
  extractLogicalExpression
} from "@nodesecure/estree-ast-utils";

// Import Internal Dependencies
import {
  notNullOrUndefined,
  isEvilIdentifierPath,
  isNeutralCallable,
  getSubMemberExpressionSegments
} from "./utils/index.js";

// CONSTANTS
const kGlobalIdentifiersToTrace = new Set([
  "globalThis",
  "global",
  "root",
  "GLOBAL",
  "window"
]);
const kRequirePatterns = new Set([
  "require",
  "require.resolve",
  "require.main",
  "process.mainModule.require",
  "process.getBuiltinModule"
]);
const kNodeModulePrefix = "node:";
const kUnsafeGlobalCallExpression = new Set(["eval", "Function"]);

export interface DataIdentifierOptions {
  /**
   * @default false
   */
  removeGlobalIdentifier?: boolean;
}

export interface SourceTraced {
  followConsecutiveAssignment?: boolean;
  moduleName?: string | null;
  name?: string;
}

export interface Traced extends Required<SourceTraced> {
  identifierOrMemberExpr: string;
  assignmentMemory: string[];
}

export interface TracedIdentifierReport {
  name: string;
  identifierOrMemberExpr: string;
  assignmentMemory: string[];
}

export class VariableTracer extends EventEmitter {
  static AssignmentEvent = Symbol("AssignmentEvent");

  // PUBLIC PROPERTIES
  literalIdentifiers = new Map<string, string>();
  importedModules = new Set<string>();

  // PRIVATE PROPERTIES
  #traced = new Map<string, Traced>();
  #variablesRefToGlobal = new Set<string>();
  #neutralCallable = new Set<string>();

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
   * @example
   * new VariableTracer()
   *  .trace("require", { followConsecutiveAssignment: true })
   *  .trace("process.mainModule")
   */
  trace(
    identifierOrMemberExpr: string,
    options: SourceTraced = {}
  ) {
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
          followConsecutiveAssignment: true,
          name,
          moduleName
        });
      }
    }

    return this;
  }

  removeGlobalIdentifier(
    identifierOrMemberExpr: string
  ): string {
    if (!identifierOrMemberExpr.includes(".")) {
      return identifierOrMemberExpr;
    }

    const globalIdentifier = [...kGlobalIdentifiersToTrace]
      .find((globalId) => identifierOrMemberExpr.startsWith(globalId));

    return globalIdentifier ?
      identifierOrMemberExpr.slice(globalIdentifier.length + 1) :
      identifierOrMemberExpr;
  }

  getDataFromIdentifier(
    identifierOrMemberExpr: string,
    options: DataIdentifierOptions = {}
  ): null | TracedIdentifierReport {
    const { removeGlobalIdentifier = false } = options;
    if (removeGlobalIdentifier) {
      // eslint-disable-next-line no-param-reassign
      identifierOrMemberExpr = this.removeGlobalIdentifier(identifierOrMemberExpr);
    }

    const isMemberExpr = identifierOrMemberExpr.includes(".");
    const isTracingIdentifier = this.#traced.has(identifierOrMemberExpr);

    let finalIdentifier = identifierOrMemberExpr;
    if (isMemberExpr && !isTracingIdentifier) {
      const [segment] = identifierOrMemberExpr.split(".");
      if (this.#traced.has(segment)) {
        const tracedIdentifier = this.#traced.get(segment)!;
        finalIdentifier = `${tracedIdentifier.identifierOrMemberExpr}${identifierOrMemberExpr.slice(segment.length)}`;
      }

      if (!this.#traced.has(finalIdentifier)) {
        return null;
      }
    }
    else if (!isTracingIdentifier) {
      return null;
    }

    const tracedIdentifier = this.#traced.get(finalIdentifier)!;
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

  #getTracedName(
    identifierOrMemberExpr: string
  ): string | null {
    return this.#traced.get(identifierOrMemberExpr)?.name ?? null;
  }

  #isTracedIdentifierImportedAsModule(
    id: Traced
  ): boolean {
    return id.moduleName === null || this.importedModules.has(id.moduleName);
  }

  #declareNewAssignment(
    identifierOrMemberExpr: string,
    id: ESTree.Identifier
  ) {
    const tracedVariant = this.#traced.get(identifierOrMemberExpr);

    // We return if required module has not been imported
    // It mean the assigment has no relation with the required tracing
    if (
      typeof tracedVariant === "undefined" ||
      !this.#isTracedIdentifierImportedAsModule(tracedVariant)
    ) {
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
      this.#traced.get(tracedVariant.name)!.assignmentMemory.push(newIdentiferName);
      this.#traced.set(newIdentiferName, tracedVariant);
    }
  }

  #isGlobalVariableIdentifier(
    identifierName: string
  ): boolean {
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
  #searchForMemberExprAlternative(
    parts: string[] = []
  ): string[] {
    return parts.flatMap((identifierName) => {
      if (this.#traced.has(identifierName)) {
        return this.#traced.get(identifierName)!.identifierOrMemberExpr;
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

  #autoTraceId(
    id: ESTree.Identifier | ESTree.ObjectPattern,
    prefix: string | null = null
  ): void {
    for (const { name, assignmentId } of getVariableDeclarationIdentifiers(id)) {
      const identifierOrMemberExpr = typeof prefix === "string" ? `${prefix}.${name}` : name;

      if (this.#traced.has(identifierOrMemberExpr)) {
        this.#declareNewAssignment(identifierOrMemberExpr, assignmentId);
      }
    }
  }

  #walkImportDeclaration(
    node: ESTree.ImportDeclaration
  ): void {
    const moduleName = stripNodePrefix(node.source.value)
      .replace(/\/promises$/, "");
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
      if (specifier.imported.type !== "Identifier") {
        continue;
      }
      const fullImportedName = `${moduleName}.${specifier.imported.name}`;

      if (this.#traced.has(fullImportedName)) {
        this.#declareNewAssignment(fullImportedName, specifier.imported);
      }
    }
  }

  #walkRequireCallExpression(
    node: ESTree.CallExpression,
    id: ESTree.Identifier | ESTree.ObjectPattern
  ): void {
    const moduleNameLiteral = node.arguments
      .find((argumentNode) => isLiteralNode(argumentNode)
        && this.#traced.has(stripNodePrefix(argumentNode.value))) as ESTree.Literal | undefined;
    if (!moduleNameLiteral) {
      return;
    }
    const moduleName = stripNodePrefix(moduleNameLiteral.value);
    this.importedModules.add(moduleName);

    switch (id.type) {
      case "Identifier":
        this.#declareNewAssignment(moduleName, id);
        break;
      case "ObjectPattern": {
        this.#autoTraceId(id, moduleName);

        break;
      }
    }
  }

  #walkVariableDeclarationWithIdentifier(
    variableDeclaratorNode: ESTree.VariableDeclarator
  ): void {
    const { init } = variableDeclaratorNode;
    if (init === null) {
      return void 0;
    }

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
    variableDeclaratorNode: ESTree.VariableDeclarator,
    childNode = variableDeclaratorNode.init
  ): void {
    if (childNode === null) {
      return;
    }
    const { id } = variableDeclaratorNode as any;

    switch (childNode.type) {
      // let foo = "10"; <-- "foo" is the key and "10" the value
      case "Literal": {
        this.literalIdentifiers.set(id.name, String(childNode.value));
        break;
      }

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
          const callExprArguments = getCallExpressionArguments(
            childNode,
            {
              externalIdentifierLookup: (name) => this.literalIdentifiers.get(name) ?? null
            }
          );
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
        const memberExprParts = [
          ...getMemberExpressionIdentifier(
            childNode,
            {
              externalIdentifierLookup: (name) => this.literalIdentifiers.get(name) ?? null
            }
          )
        ];
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

  #walkVariableDeclarationWithAnythingElse(
    variableDeclaratorNode: ESTree.VariableDeclarator
  ): void {
    const { init } = variableDeclaratorNode;
    if (init === null) {
      return;
    }
    const id = variableDeclaratorNode.id as any;

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

  walk(node: ESTree.Node): void {
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

function stripNodePrefix(value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  return value.startsWith(kNodeModulePrefix) ?
    value.slice(kNodeModulePrefix.length) :
    value;
}

function isLiteralNode(
  node: ESTree.Node
): node is ESTree.Literal {
  return node.type === "Literal";
}

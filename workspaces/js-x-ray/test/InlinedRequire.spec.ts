// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

// Import Third-party Dependencies
import { generate } from "astring";

// Import Internal Dependencies
import { parseScript } from "./helpers.ts";
import { InlinedRequire } from "../src/probes/isRequire/InlinedRequire.ts";
import { VirtualVariableIdentifier } from "../src/VirtualVariableIdentifier.ts";

describe("InlinedRequire", () => {
  beforeEach(() => {
    VirtualVariableIdentifier.reset();
  });

  describe("assertNode()", () => {
    it("should return false for a require() call expression", () => {
      const ast = parseScript(`require("fs");`);
      const node = getExpressionFromStatement(ast.body[0]);

      assert.strictEqual(
        InlinedRequire.assertNode(node),
        false
      );
    });

    it("should return false for a require() call expression with property access", () => {
      const ast = parseScript(`require("fs").promises;`);
      const node = getExpressionFromStatement(ast.body[0]);

      assert.strictEqual(
        InlinedRequire.assertNode(node),
        false
      );
    });

    it("should return true for an inlined require() call expression", () => {
      const ast = parseScript(`require("child_process").spawn("csrutil", ["disable"]);`);
      const node = getExpressionFromStatement(ast.body[0]);

      assert.strictEqual(
        InlinedRequire.assertNode(node),
        true
      );
    });
  });

  describe("split()", () => {
    it("should return null for a simple require() call", () => {
      const ast = parseScript(`require("fs");`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.strictEqual(result, null);
    });

    it("should return null for a require() with property access but no method call", () => {
      const ast = parseScript(`require("fs").promises;`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.strictEqual(result, null);
    });

    it("should split require('child_process').spawn() into virtual declaration and rebuilt expression", () => {
      const ast = parseScript(`require("child_process").spawn("csrutil", ["disable"]);`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.ok(result !== null);
      assert.strictEqual(result.virtualIdentifier, "__virtual_require_0__");
      assert.strictEqual(
        generate(result.virtualDeclaration),
        `const __virtual_require_0__ = require("child_process");`
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        `__virtual_require_0__.spawn("csrutil", ["disable"])`
      );
    });

    it("should return null for require('fs').promises.readFile() because callee is MemberExpression", () => {
      // require("fs").promises.readFile() has callee = require("fs").promises (MemberExpression)
      // assertNode only matches patterns like require.something() not require().something.method()
      const ast = parseScript(`require("fs").promises.readFile("./package.json");`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.strictEqual(result, null);
    });

    it("should split require('fs').readFileSync() correctly", () => {
      const ast = parseScript(`require("fs").readFileSync("./package.json");`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.ok(result !== null);
      assert.strictEqual(result.virtualIdentifier, "__virtual_require_0__");
      assert.strictEqual(
        generate(result.virtualDeclaration),
        `const __virtual_require_0__ = require("fs");`
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        `__virtual_require_0__.readFileSync("./package.json")`
      );
    });

    it("should increment virtual identifiers across multiple splits", () => {
      const ast1 = parseScript(`require("fs").readFileSync("a.txt");`);
      const node1 = getExpressionFromStatement(ast1.body[0]);

      const ast2 = parseScript(`require("path").join("a", "b");`);
      const node2 = getExpressionFromStatement(ast2.body[0]);

      const result1 = InlinedRequire.split(node1);
      const result2 = InlinedRequire.split(node2);

      assert.ok(result1 !== null);
      assert.ok(result2 !== null);
      assert.strictEqual(result1.virtualIdentifier, "__virtual_require_0__");
      assert.strictEqual(result2.virtualIdentifier, "__virtual_require_1__");
    });

    it("should handle require() with computed property access", () => {
      const ast = parseScript(`require("obj")["method"]("arg");`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.ok(result !== null);
      assert.strictEqual(
        generate(result.virtualDeclaration),
        `const __virtual_require_0__ = require("obj");`
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        `__virtual_require_0__["method"]("arg")`
      );
    });

    it("should return rebuildExpression as null when the node is the require call itself", () => {
      // This tests the edge case where split() receives a node that passes assertNode
      // but where the root node IS the require call (shouldn't happen in practice
      // since assertNode checks for require.*, but let's verify the behavior)
      const ast = parseScript(`require.resolve("fs");`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      // require.resolve doesn't have a nested require() call, so it should return null
      assert.strictEqual(result, null);
    });

    it("should return null for non-CallExpression node", () => {
      const ast = parseScript("const x = 5;");
      const node = ast.body[0];

      const result = InlinedRequire.split(node);

      assert.strictEqual(result, null);
    });

    it("should return null for CallExpression that is not a require pattern", () => {
      const ast = parseScript(`console.log("hello");`);
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedRequire.split(node);

      assert.strictEqual(result, null);
    });
  });
});

export function getExpressionFromStatement(node: any) {
  return node.type === "ExpressionStatement" ? node.expression : null;
}

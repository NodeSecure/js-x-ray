// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

// Import Third-party Dependencies
import { generate } from "astring";

// Import Internal Dependencies
import { parseScript, getExpressionFromStatement } from "./helpers.ts";
import { InlinedCallExpression } from "../src/InlinedCallExpression.ts";
import { VirtualVariableIdentifier } from "../src/VirtualVariableIdentifier.ts";

describe("InlinedCallExpression", () => {
  beforeEach(() => {
    VirtualVariableIdentifier.reset();
  });

  describe("split", () => {
    it("should split pino().info('hello')", () => {
      const ast = parseScript("pino().info('hello');");
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedCallExpression.split(node);

      assert.ok(result !== null);

      assert.strictEqual(result.virtualIdentifier, "__virtual_call_expression_0__");
      assert.strictEqual(
        generate(result.virtualDeclaration),
        "const __virtual_call_expression_0__ = pino();"
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        "__virtual_call_expression_0__.info('hello')"
      );
    });

    it("should split pino({}).info('hello')", () => {
      const ast = parseScript("pino({}).info('hello');");
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedCallExpression.split(node);

      assert.ok(result !== null);

      assert.strictEqual(result.virtualIdentifier, "__virtual_call_expression_0__");
      assert.strictEqual(
        generate(result.virtualDeclaration),
        "const __virtual_call_expression_0__ = pino({});"
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        "__virtual_call_expression_0__.info('hello')"
      );
    });

    it("should increment virtual identifiers across multiple splits", () => {
      const ast1 = parseScript("pino().info('hello');");
      const node1 = getExpressionFromStatement(ast1.body[0]);

      const ast2 = parseScript("pino().error('hello');;");
      const node2 = getExpressionFromStatement(ast2.body[0]);

      const result1 = InlinedCallExpression.split(node1);
      const result2 = InlinedCallExpression.split(node2);

      assert.ok(result1 !== null);
      assert.ok(result2 !== null);
      assert.strictEqual(result1.virtualIdentifier, "__virtual_call_expression_0__");
      assert.strictEqual(result2.virtualIdentifier, "__virtual_call_expression_1__");
    });
  });

  it("should be null for simple function call", () => {
    const ast = parseScript("pino();");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for property access", () => {
    const ast = parseScript("pino().info;");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for simple member function call", () => {
    const ast = parseScript("foo.bar();");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for inlined new expression", () => {
    const ast = parseScript("(new Foo()).bar();");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for require expression", () => {
    const ast = parseScript(`require("child_process").spawn("csrutil", ["disable"]);`);
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for eval expression", () => {
    const ast = parseScript("const stream = eval('require')('stream');");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);
    assert.strictEqual(result, null);
  });

  it("should be able to handle chained operations", () => {
    const ast = parseScript("fn().bar.foo().bar.foo().bar;");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedCallExpression.split(node);

    assert.ok(result !== null);

    assert.strictEqual(result.virtualIdentifier, "__virtual_call_expression_0__");
    assert.strictEqual(
      generate(result.virtualDeclaration),
      "const __virtual_call_expression_0__ = fn();"
    );
    assert.ok(result.rebuildExpression !== null);
    assert.strictEqual(
      generate(result.rebuildExpression),
      "__virtual_call_expression_0__.bar.foo().bar.foo().bar"
    );
  });
});

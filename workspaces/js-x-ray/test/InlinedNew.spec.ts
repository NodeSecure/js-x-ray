// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

// Import Third-party Dependencies
import { generate } from "astring";

// Import Internal Dependencies
import { parseScript, getExpressionFromStatement } from "./helpers.ts";
import { InlinedNew } from "../src/InlinedNew.ts";
import { VirtualVariableIdentifier } from "../src/VirtualVariableIdentifier.ts";

describe("InlinedNew", () => {
  beforeEach(() => {
    VirtualVariableIdentifier.reset();
  });

  describe("split", () => {
    it("should split (new vm.Script(code, options)).runInContext()", () => {
      const ast = parseScript("(new vm.Script(code, options)).runInContext(sandbox);");
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedNew.split(node);

      assert.ok(result !== null);

      assert.strictEqual(result.virtualIdentifier, "__virtual_new_0__");
      assert.strictEqual(
        generate(result.virtualDeclaration),
        "const __virtual_new_0__ = new vm.Script(code, options);"
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        "__virtual_new_0__.runInContext(sandbox)"
      );
    });

    it("should split (new vm.Script(code, options)).runInContext()", () => {
      const ast = parseScript("(new vm.Script(code, options)).runInContext;");
      const node = getExpressionFromStatement(ast.body[0]);

      const result = InlinedNew.split(node);

      assert.ok(result !== null);

      assert.strictEqual(result.virtualIdentifier, "__virtual_new_0__");
      assert.strictEqual(
        generate(result.virtualDeclaration),
        "const __virtual_new_0__ = new vm.Script(code, options);"
      );
      assert.ok(result.rebuildExpression !== null);
      assert.strictEqual(
        generate(result.rebuildExpression),
        "__virtual_new_0__.runInContext"
      );
    });

    it("should increment virtual identifiers across multiple splits", () => {
      const ast1 = parseScript("(new vm.Script(code, options)).runInContext(sandbox);");
      const node1 = getExpressionFromStatement(ast1.body[0]);

      const ast2 = parseScript("(new vm.Script(code, options)).runInContext(sandbox);");
      const node2 = getExpressionFromStatement(ast2.body[0]);

      const result1 = InlinedNew.split(node1);
      const result2 = InlinedNew.split(node2);

      assert.ok(result1 !== null);
      assert.ok(result2 !== null);
      assert.strictEqual(result1.virtualIdentifier, "__virtual_new_0__");
      assert.strictEqual(result2.virtualIdentifier, "__virtual_new_1__");
    });
  });

  it("should be null for simple new call", () => {
    const ast = parseScript("new Foo();");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedNew.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for property access", () => {
    const ast = parseScript("foo.bar;");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedNew.split(node);
    assert.strictEqual(result, null);
  });

  it("should be null for function call", () => {
    const ast = parseScript("foo.bar();");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedNew.split(node);
    assert.strictEqual(result, null);
  });

  it("should be able to handle chained operations", () => {
    const ast = parseScript("(new Foo()).bar.foo().bar.foo().bar;");
    const node = getExpressionFromStatement(ast.body[0]);

    const result = InlinedNew.split(node);

    assert.ok(result !== null);

    assert.strictEqual(result.virtualIdentifier, "__virtual_new_0__");
    assert.strictEqual(
      generate(result.virtualDeclaration),
      "const __virtual_new_0__ = new Foo();"
    );
    assert.ok(result.rebuildExpression !== null);
    assert.strictEqual(
      generate(result.rebuildExpression),
      "__virtual_new_0__.bar.foo().bar.foo().bar"
    );
  });
});


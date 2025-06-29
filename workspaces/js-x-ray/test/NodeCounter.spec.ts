// Import Node.js Dependencies
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import { walk } from "estree-walker";

// Import Internal Dependencies
import { NodeCounter } from "../src/NodeCounter.js";
import { JsSourceParser } from "../src/index.js";
import { isNode } from "../src/types/estree.js";

describe("NodeCounter", () => {
  describe("constructor", () => {
    it("should use name options instead of type", () => {
      const nc = new NodeCounter("UnaryExpression", {
        name: "DoubleUnaryExpression"
      });

      assert.equal(nc.name, "DoubleUnaryExpression");
    });
  });

  it("should trigger filter and match functions when node.type is matching", () => {
    const match = mock.fn();
    const filter = mock.fn(() => true);

    const nc = new NodeCounter<ESTree.FunctionDeclaration>(
      "FunctionDeclaration",
      { match, filter }
    );

    const body = new JsSourceParser().parse(
      "function foo() {};"
    );
    walkAst(body, (node) => nc.walk(node));

    assert.equal(filter.mock.callCount(), 1);
    assert.equal(match.mock.callCount(), 1);
    assert.equal(nc.count, 1);
    assert.deepEqual(nc.properties, {});
  });

  it("should count one for a FunctionDeclaration with an identifier", () => {
    const ids: string[] = [];
    const nc = new NodeCounter<ESTree.FunctionDeclaration>(
      "FunctionDeclaration",
      {
        match: (node) => {
          if (node.id) {
            ids.push(node.id.name);
          }
        }
      }
    );
    assert.equal(nc.type, "FunctionDeclaration");
    assert.equal(nc.name, "FunctionDeclaration");
    assert.equal(nc.lookup, null);

    const body = new JsSourceParser().parse(
      "function foo() {};"
    );
    walkAst(body, (node) => nc.walk(node));

    assert.equal(nc.count, 1);
    assert.deepEqual(nc.properties, {});
    assert.deepEqual(ids, ["foo"]);
  });

  it("should count zero for a FunctionExpression with no identifier", () => {
    const nc = new NodeCounter<ESTree.FunctionExpression>(
      "FunctionExpression",
      {
        filter: (node) => isNode(node.id) && node.id.type === "Identifier"
      }
    );
    assert.equal(nc.type, "FunctionExpression");
    assert.equal(nc.lookup, null);

    const body = new JsSourceParser().parse(
      "const foo = function() {};"
    );
    walkAst(body, (node) => nc.walk(node));

    assert.equal(nc.count, 0);
    assert.deepEqual(nc.properties, {});
  });

  it("should count VariableDeclaration kinds property", () => {
    const nc = new NodeCounter(
      "VariableDeclaration[kind]"
    );
    assert.equal(nc.type, "VariableDeclaration");
    assert.equal(nc.lookup, "kind");

    const body = new JsSourceParser().parse(
      `let foo, xd = 5;
      const yo = 2;
      const mdr = 5;`
    );
    walkAst(body, (node) => nc.walk(node));

    assert.equal(nc.count, 3);
    assert.deepEqual(nc.properties, {
      let: 1,
      const: 2
    });
  });

  it("should count MemberExpression computed property", () => {
    const nc = new NodeCounter(
      "MemberExpression[computed]"
    );
    assert.equal(nc.name, "MemberExpression");
    assert.equal(nc.type, "MemberExpression");
    assert.equal(nc.lookup, "computed");

    const body = new JsSourceParser().parse(
      "yoo.xd[\"damn\"].oh;"
    );
    walkAst(body, (node) => nc.walk(node));

    assert.equal(nc.count, 3);
    assert.deepEqual(nc.properties, {
      true: 1,
      false: 2
    });
  });
});

function walkAst(
  body: any,
  callback: (node: any) => void = () => void 0
) {
  walk(body, {
    enter(node) {
      if (!Array.isArray(node)) {
        callback(node);
      }
    }
  });
}

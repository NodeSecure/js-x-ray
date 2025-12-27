// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { walk } from "../src/walker/index.ts";

describe("walk", () => {
  it("walks a malformed node", () => {
    const block: any = [
      {
        type: "Foo",
        answer: undefined
      },
      {
        type: "Foo",
        answer: {
          type: "Answer",
          value: 42
        }
      }
    ];

    let answer: any;
    walk(
      // @ts-expect-error
      { type: "Test", block },
      {
        enter(node: any) {
          if (node.type === "Answer") {
            answer = node;
          }
        }
      }
    );

    assert.strictEqual(answer, block[1].answer);
  });

  it("walks an AST", () => {
    const ast: ESTree.Program = {
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "a" },
              init: { type: "Literal", value: 1, raw: "1" }
            },
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "b" },
              init: { type: "Literal", value: 2, raw: "2" }
            }
          ],
          kind: "var"
        }
      ],
      sourceType: "module"
    };

    const entered: ESTree.Node[] = [];
    const left: ESTree.Node[] = [];

    walk(ast, {
      enter(node) {
        entered.push(node);
      },
      leave(node) {
        left.push(node);
      }
    });

    // @ts-expect-error
    const declarations = ast.body[0].declarations;

    assert.deepEqual(entered, [
      ast,
      ast.body[0],
      declarations[0],
      declarations[0].id,
      declarations[0].init,
      declarations[1],
      declarations[1].id,
      declarations[1].init
    ]);

    assert.deepEqual(left, [
      declarations[0].id,
      declarations[0].init,
      declarations[0],
      declarations[1].id,
      declarations[1].init,
      declarations[1],
      ast.body[0],
      ast
    ]);
  });

  it("handles null literals", () => {
    const ast: ESTree.Program = {
      type: "Program",
      start: 0,
      end: 8,
      body: [
        {
          type: "ExpressionStatement",
          start: 0,
          end: 5,
          expression: {
            type: "Literal",
            start: 0,
            end: 4,
            value: null,
            raw: "null"
          }
        },
        {
          type: "ExpressionStatement",
          start: 6,
          end: 8,
          expression: {
            type: "Literal",
            start: 6,
            end: 7,
            value: 1,
            raw: "1"
          }
        }
      ],
      sourceType: "module"
    };

    walk(ast, {
      enter() {
        // do nothing
      },
      leave() {
        // do nothing
      }
    });

    assert.ok(true);
  });

  it("allows walk() to be invoked within a walk, without context corruption", () => {
    const ast: ESTree.Program = {
      type: "Program",
      start: 0,
      end: 8,
      body: [
        {
          type: "ExpressionStatement",
          start: 0,
          end: 6,
          expression: {
            type: "BinaryExpression",
            start: 0,
            end: 5,
            left: {
              type: "Identifier",
              start: 0,
              end: 1,
              name: "a"
            },
            operator: "+",
            right: {
              type: "Identifier",
              start: 4,
              end: 5,
              name: "b"
            }
          }
        }
      ],
      sourceType: "module"
    };

    const identifiers: string[] = [];

    walk(ast, {
      enter(node) {
        if (node.type === "ExpressionStatement") {
          walk(node, {
            enter() {
              this.skip();
            }
          });
        }

        if (node.type === "Identifier") {
          identifiers.push(node.name);
        }
      }
    });

    assert.deepEqual(identifiers, ["a", "b"]);
  });

  it("replaces a node", () => {
    const phases = ["enter", "leave"] as const;
    for (const phase of phases) {
      const ast: ESTree.Program = {
        type: "Program",
        start: 0,
        end: 8,
        body: [
          {
            type: "ExpressionStatement",
            start: 0,
            end: 6,
            expression: {
              type: "BinaryExpression",
              start: 0,
              end: 5,
              left: {
                type: "Identifier",
                start: 0,
                end: 1,
                name: "a"
              },
              operator: "+",
              right: {
                type: "Identifier",
                start: 4,
                end: 5,
                name: "b"
              }
            }
          }
        ],
        sourceType: "module"
      };

      const forty_two: ESTree.Literal = {
        type: "Literal",
        value: 42,
        raw: "42"
      };

      walk(ast, {
        [phase](node: ESTree.Node) {
          if (node.type === "Identifier" && node.name === "b") {
            this.replace(forty_two);
          }
        }
      });

      // @ts-expect-error
      assert.strictEqual(ast.body[0].expression.right, forty_two);
    }
  });

  it("replaces a top-level node", () => {
    const ast: ESTree.Identifier = {
      type: "Identifier",
      name: "answer"
    };

    const forty_two: ESTree.Literal = {
      type: "Literal",
      value: 42,
      raw: "42"
    };

    const node = walk(ast, {
      enter(node) {
        if (node.type === "Identifier" && node.name === "answer") {
          this.replace(forty_two);
        }
      }
    });

    assert.strictEqual(node, forty_two);
  });

  it("removes a node property", () => {
    const phases = ["enter", "leave"] as const;
    for (const phase of phases) {
      const ast: ESTree.Program = {
        type: "Program",
        start: 0,
        end: 8,
        body: [
          {
            type: "ExpressionStatement",
            start: 0,
            end: 6,
            expression: {
              type: "BinaryExpression",
              start: 0,
              end: 5,
              left: {
                type: "Identifier",
                start: 0,
                end: 1,
                name: "a"
              },
              operator: "+",
              right: {
                type: "Identifier",
                start: 4,
                end: 5,
                name: "b"
              }
            }
          }
        ],
        sourceType: "module"
      };

      walk(ast, {
        [phase](node: ESTree.Node) {
          if (node.type === "Identifier" && node.name === "b") {
            this.remove();
          }
        }
      });

      // @ts-expect-error
      assert.strictEqual(ast.body[0].expression.right, undefined);
    }
  });

  it("removes a node from array", () => {
    const phases = ["enter", "leave"] as const;
    for (const phase of phases) {
      const ast: ESTree.Program = {
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            declarations: [
              {
                type: "VariableDeclarator",
                id: {
                  type: "Identifier",
                  name: "a"
                },
                init: null
              },
              {
                type: "VariableDeclarator",
                id: {
                  type: "Identifier",
                  name: "b"
                },
                init: null
              },
              {
                type: "VariableDeclarator",
                id: {
                  type: "Identifier",
                  name: "c"
                },
                init: null
              }
            ],
            kind: "let"
          }
        ],
        sourceType: "module"
      };

      const visitedIndex: number[] = [];
      walk(ast, {
        [phase](node, ctx) {
          if (node.type === "VariableDeclarator") {
            visitedIndex.push(ctx.index);
            if (node.id.name === "a" || node.id.name === "b") {
              this.remove();
            }
          }
        }
      });

      // @ts-expect-error
      const declarations = ast.body[0].declarations;

      assert.strictEqual(declarations.length, 1);
      assert.strictEqual(declarations[0].id.name, "c");
      assert.strictEqual(visitedIndex.length, 3);
      assert.deepEqual(visitedIndex, [0, 0, 0]);
    }
  });
});

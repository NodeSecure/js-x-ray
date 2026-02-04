// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { toLiteral } from "../../src/estree/index.ts";

describe("toLiteral", () => {
  it("should transform a TemplateLiteral to a literal", () => {
    assert.strictEqual(toLiteral({
      type: "TemplateLiteral",
      quasis: [],
      expressions: []
    }), "");

    assert.strictEqual(toLiteral({
      type: "TemplateLiteral",
      quasis: [{
        type: "TemplateElement",
        value: {
          raw: "hello",
          cooked: null
        },
        tail: true
      }
      ],
      expressions: []
    }), "hello");

    assert.strictEqual(toLiteral({
      type: "TemplateLiteral",
      quasis: [{
        type: "TemplateElement",
        value: {
          raw: "hello ",
          cooked: null
        },
        tail: false
      },
      {
        type: "TemplateElement",
        value: {
          raw: " world",
          cooked: null
        },
        tail: true
      }
      ],
      expressions: [{
        type: "Literal",
        value: 1,
        raw: "1"
      }]
    }), `hello \${${0}} world`);

    assert.strictEqual(toLiteral({
      type: "TemplateLiteral",
      quasis: [{
        type: "TemplateElement",
        value: {
          raw: "hello ",
          cooked: null
        },
        tail: false
      },
      {
        type: "TemplateElement",
        value: {
          raw: " world ",
          cooked: null
        },
        tail: false
      },
      {
        type: "TemplateElement",
        value: {
          raw: " ",
          cooked: null
        },
        tail: true
      }
      ],
      expressions: [{
        type: "Literal",
        value: 1,
        raw: "1"
      }, {
        type: "Literal",
        value: 1,
        raw: "1"
      }]

    }), `hello \${${0}} world \${${1}} `);
  });
});


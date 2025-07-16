// Import Node.js Dependencies
import { describe, mock, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import {
  AstAnalyser,
  JsSourceParser,
  Pipelines
} from "../src/index.js";
import {
  getWarningKind
} from "./utils/index.js";

describe("AstAnalyser pipelines", () => {
  test("should iterate once on the pipeline", () => {
    const pipeline = {
      name: "test-pipeline",
      walk: mock.fn((body) => body)
    };

    const analyser = new AstAnalyser({
      customParser: new JsSourceParser(),
      pipelines: [
        pipeline,
        pipeline
      ]
    });

    analyser.analyse(`return "Hello World";`);

    assert.strictEqual(pipeline.walk.mock.callCount(), 1);
    assert.deepEqual(
      pipeline.walk.mock.calls[0].arguments[0],
      [
        {
          type: "ReturnStatement",
          argument: {
            type: "Literal",
            value: "Hello World",
            raw: "\"Hello World\"",
            loc: {
              start: {
                line: 1,
                column: 7
              },
              end: {
                line: 1,
                column: 20
              }
            }
          },
          loc: {
            start: {
              line: 1,
              column: 0
            },
            end: {
              line: 1,
              column: 21
            }
          }
        }
      ]
    );
  });
});

describe("Pipelines.deobfuscate", () => {
  test("should find a shady-url by deobfuscating a joined ArrayExpression", () => {
    const analyser = new AstAnalyser({
      customParser: new JsSourceParser(),
      pipelines: [
        new Pipelines.deobfuscate()
      ]
    });

    const { warnings } = analyser.analyse(`
      const URL = ["http://", ["77", "244", "210", "1"].join("."), "/script"].join("");
    `);

    assert.deepEqual(
      getWarningKind(warnings),
      ["shady-link"].sort()
    );
  });
});

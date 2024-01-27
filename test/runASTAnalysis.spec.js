// Import Node.js Dependencies
import { it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";
import { AstAnalyser } from "../src/AstAnalyser.js";
import { JsSourceParser } from "../src/JsSourceParser.js";
import { FakeSourceParser } from "./fixtures/FakeSourceParser.js";

it("should call AstAnalyser.analyse with the expected arguments", (t) => {
  t.mock.method(AstAnalyser.prototype, "analyse");

  const source = "const http = require(\"http\");";
  runASTAnalysis(source, { module: true, removeHTMLComments: true });

  const source2 = "const fs = require(\"fs\");";
  runASTAnalysis(source2, { module: false, removeHTMLComments: false });

  const calls = AstAnalyser.prototype.analyse.mock.calls;
  assert.strictEqual(calls.length, 2);

  assert.deepEqual(calls[0].arguments, [source, { module: true, removeHTMLComments: true }]);
  assert.deepEqual(calls[1].arguments, [source2, { module: false, removeHTMLComments: false }]);
});

it("should instantiate AstAnalyser with the expected parser", (t) => {
  t.mock.method(JsSourceParser.prototype, "parse");
  t.mock.method(FakeSourceParser.prototype, "parse");

  runASTAnalysis("const http = require(\"http\");", { module: true, removeHTMLComments: true });

  runASTAnalysis("const fs = require(\"fs\");",
    { module: false, removeHTMLComments: false, customParser: new FakeSourceParser() }
  );

  assert.strictEqual(JsSourceParser.prototype.parse.mock.calls.length, 1);
  assert.strictEqual(FakeSourceParser.prototype.parse.mock.calls.length, 1);
});

// Import Node.js Dependencies
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

// CONSTANTS
const kFixtureURL = new URL("../fixtures/issues/", import.meta.url);

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/109
test("it should not crash for a JavaScript file containing HTML comments (and removeHTMLComments option enabled)", () => {
  const htmlComment = readFileSync(new URL("html-comments.js", kFixtureURL), "utf-8");
  new AstAnalyser().analyse(htmlComment, {
    removeHTMLComments: true
  });
});

test("it should crash for a JavaScript file containing HTML comments", () => {
  const htmlComment = readFileSync(new URL("html-comments.js", kFixtureURL), "utf-8");

  assert.throws(() => new AstAnalyser().analyse(htmlComment));
});

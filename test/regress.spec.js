// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/regress/", import.meta.url);

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/59
test("it should not crash for prop-types", () => {
  const propTypes = readFileSync(
    new URL("prop-types.min.js", FIXTURE_URL),
    "utf-8"
  );
  runASTAnalysis(propTypes);
});

test("it should not crash for JSX", () => {
  const propTypes = readFileSync(
    new URL("jsx.js", FIXTURE_URL),
    "utf-8"
  );
  runASTAnalysis(propTypes);
});

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/109
test("it should not crash for a JavaScript file containing HTML comments (and removeHTMLComments option enabled)", () => {
  const htmlComment = readFileSync(new URL("html-comments.js", FIXTURE_URL), "utf-8");
  runASTAnalysis(htmlComment, {
    removeHTMLComments: true
  });
});

test("it should crash for a JavaScript file containing HTML comments", (t) => {
  const htmlComment = readFileSync(new URL("html-comments.js", FIXTURE_URL), "utf-8");

  assert.throws(() => runASTAnalysis(htmlComment));
});

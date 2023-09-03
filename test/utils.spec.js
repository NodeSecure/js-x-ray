// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { removeHTMLComment } from "../src/utils.js";

test("removeHTMLComment() function should remove singleline HTML comment from string", () => {
  const result = removeHTMLComment(`
    <!-- const yo = 5; -->
  `);
  assert.strictEqual(result.trim(), "");
});

test("removeHTMLComment() function should remove multiline HTML comment from string", () => {
  const result = removeHTMLComment(`
    <!--
  // == fake comment == //

  const yo = 5;
  //-->
  `);
  assert.strictEqual(result.trim(), "");
});

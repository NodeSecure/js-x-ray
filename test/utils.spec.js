// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { removeHTMLComment } from "../src/utils.js";

test("removeHTMLComment() function should remove singleline HTML comment from string", (tape) => {
  const result = removeHTMLComment(`
    <!-- const yo = 5; -->
  `);
  tape.strictEqual(result.trim(), "");

  tape.end();
});

test("removeHTMLComment() function should remove multiline HTML comment from string", (tape) => {
  const result = removeHTMLComment(`
    <!--
  // == fake comment == //

  const yo = 5;
  //-->
  `);
  tape.strictEqual(result.trim(), "");

  tape.end();
});

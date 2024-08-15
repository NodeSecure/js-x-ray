// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../index.js";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/163
 */
// CONSTANTS
const kIncriminedCodeSample = `
const argv = process.argv.slice(2);

function foobar() {
  console.log("foobar");
}

if (!argv.length) {
  return foobar();
}
`;

test("it should not throw error whatever module is true or false", () => {
  assert.doesNotThrow(() => {
    new AstAnalyser().analyse(kIncriminedCodeSample, { module: false });
  });
  assert.doesNotThrow(() => {
    new AstAnalyser().analyse(kIncriminedCodeSample, { module: true });
  });
});

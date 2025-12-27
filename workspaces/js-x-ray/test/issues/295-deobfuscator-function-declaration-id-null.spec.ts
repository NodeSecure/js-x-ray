// Import Node.js Dependencies
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/295
 */
test("Deobfuscator.#extractCounterIdentifiers should not throw if FunctionDeclaration id is null", () => {
  new AstAnalyser().analyse(`
    export default async function (app) {
      app.loaded = true
    }
  `);
});

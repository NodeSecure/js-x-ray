// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser, DefaultCollectableSet, type Dependency } from "../../src/index.ts";
import { extractDependencies } from "../helpers.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/177
 */
test("should detect unsafe-import and unsafe-statement", () => {
  const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
  const { warnings } = new AstAnalyser({
    collectables: [dependencySet]
  }).analyse(`const help = require('help-me')({
    dir: path.join(__dirname, 'help'),
    ext: '.txt'
  })`);

  const dependencies = extractDependencies(dependencySet);

  assert.strictEqual(warnings.length, 0);
  assert.ok(dependencies.has("help-me"));
  const dependency = dependencies.get("help-me");

  assert.deepEqual(Array.from(dependencySet).find(({ value }) => value === "help-me")?.locations[0].location,
    [[[1, 13], [1, 31]]]
  );

  assert.deepEqual(
    dependency,
    {
      unsafe: false,
      inTry: false
    }
  );
});

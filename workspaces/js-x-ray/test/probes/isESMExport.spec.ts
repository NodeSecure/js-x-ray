// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser, DefaultCollectableSet } from "../../src/index.ts";

describe("probe: isESMExport", () => {
  it("should detect ExportNamedDeclaration statement with a Literal source as dependency", () => {
    const code = `
      export { foo } from "./bar.js";
      export const bar = "foo";
    `;

    const dependencySet = new DefaultCollectableSet("dependency");

    new AstAnalyser({
      collectables: [dependencySet]
    }).analyse(code);

    assert.deepEqual(
      Array.from(dependencySet).map(({ value }) => value),
      ["./bar.js"]
    );
  });

  it("should detect ExportAllDeclaration statement as dependency", () => {
    const code = `
      export * from "./bar.js";
    `;
    const dependencySet = new DefaultCollectableSet("dependency");

    new AstAnalyser({
      collectables: [dependencySet]
    }).analyse(code);

    assert.deepEqual(
      Array.from(dependencySet).map(({ value }) => value),
      ["./bar.js"]
    );
  });
});


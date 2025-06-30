// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

describe("probe: isESMExport", () => {
  it("should detect ExportNamedDeclaration statement with a Literal source as dependency", () => {
    const code = `
      export { foo } from "./bar.js";
      export const bar = "foo";
    `;
    const { dependencies } = new AstAnalyser().analyse(code);

    assert.deepEqual(
      [...dependencies.keys()],
      ["./bar.js"]
    );
  });

  it("should detect ExportAllDeclaration statement as dependency", () => {
    const code = `
      export * from "./bar.js";
    `;
    const { dependencies } = new AstAnalyser().analyse(code);

    assert.deepEqual(
      [...dependencies.keys()],
      ["./bar.js"]
    );
  });
});


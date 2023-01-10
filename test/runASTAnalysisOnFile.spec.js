// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { runASTAnalysisOnFile } from "../index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

test("it remove the packageName from the dependencies list", async(tape) => {
  const result = await runASTAnalysisOnFile(
    new URL("depName.js", FIXTURE_URL),
    { module: false, packageName: "foobar" }
  );

  tape.ok(result.ok);
  tape.strictEqual(result.warnings.length, 0);
  tape.deepEqual([...result.dependencies],
    ["open"]
  );

  tape.end();
});

test("it should fail with a parsing error", async(tape) => {
  const result = await runASTAnalysisOnFile(
    new URL("parsingError.js", FIXTURE_URL),
    { module: false, packageName: "foobar" }
  );

  tape.strictEqual(result.ok, false);
  tape.strictEqual(result.warnings.length, 1);

  const parsingError = result.warnings[0];
  tape.strictEqual(parsingError.kind, "parsing-error");

  tape.end();
});

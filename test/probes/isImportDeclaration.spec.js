// Require Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isImportDeclaration from "../../src/probes/isImportDeclaration.js";

// Require Third-party dependencies
import test from "tape";

test("should detect 1 dependency for an ImportNamespaceSpecifier", (tape) => {
  const str = "import * as foo from \"bar\"";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isImportDeclaration);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect 1 dependency for an ImportDefaultSpecifier", (tape) => {
  const str = "import foo from \"bar\"";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isImportDeclaration);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect 1 dependency for an ImportSpecifier", (tape) => {
  const str = "import { xd } from \"bar\"";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isImportDeclaration);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect 1 dependency with no specificiers", (tape) => {
  const str = "import \"bar\"";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isImportDeclaration);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect an unsafe import using data:text/javascript and throw a unsafe-import warning", (tape) => {
  const expectedValue = "data:text/javascript;base64,Y29uc29sZS5sb2coJ2hlbGxvIHdvcmxkJyk7Cg==";
  const str = `import '${expectedValue}';`;

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isImportDeclaration);

  const { warnings } = analysis;
  tape.strictEqual(warnings.length, 1);

  const [unsafeImport] = warnings;
  tape.strictEqual(unsafeImport.kind, "unsafe-import");
  tape.strictEqual(unsafeImport.value, expectedValue);

  tape.end();
});

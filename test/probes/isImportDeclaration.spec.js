// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isImportDeclaration from "../../src/probes/isImportDeclaration.js";

test("should detect 1 dependency for an ImportNamespaceSpecifier", (tape) => {
  const str = "import * as foo from \"bar\"";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect 1 dependency for an ImportDefaultSpecifier", (tape) => {
  const str = "import foo from \"bar\"";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect 1 dependency for an ImportSpecifier", (tape) => {
  const str = "import { xd } from \"bar\"";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect 1 dependency with no specificiers", (tape) => {
  const str = "import \"bar\"";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = analysis.dependencies;
  tape.strictEqual("bar" in dependencies, true);

  tape.end();
});

test("should detect an unsafe import using data:text/javascript and throw a unsafe-import warning", (tape) => {
  const expectedValue = "data:text/javascript;base64,Y29uc29sZS5sb2coJ2hlbGxvIHdvcmxkJyk7Cg==";
  const str = `import '${expectedValue}';`;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isImportDeclaration)
    .execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 1);

  const unsafeImport = sastAnalysis.getWarning("unsafe-import");
  tape.strictEqual(unsafeImport.value, expectedValue);

  tape.end();
});

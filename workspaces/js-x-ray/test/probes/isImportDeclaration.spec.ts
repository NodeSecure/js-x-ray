// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isImportDeclaration from "../../src/probes/isImportDeclaration.js";

test("should detect 1 dependency for an ImportNamespaceSpecifier", () => {
  const str = "import * as foo from \"bar\"";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = sourceFile;
  assert.ok(dependencies.has("bar"));
});

test("should detect 1 dependency for an ImportDefaultSpecifier", () => {
  const str = "import foo from \"bar\"";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = sourceFile;
  assert.ok(dependencies.has("bar"));
});

test("should detect 1 dependency for an ImportSpecifier", () => {
  const str = "import { xd } from \"bar\"";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = sourceFile;
  assert.ok(dependencies.has("bar"));
});

test("should detect 1 dependency with no specificiers", () => {
  const str = "import \"bar\"";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = sourceFile;
  assert.ok(dependencies.has("bar"));
});

test("should detect 1 dependency for an ImportExpression", () => {
  const str = "import(\"bar\")";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isImportDeclaration)
    .execute(ast.body);

  const { dependencies } = sourceFile;
  assert.ok(dependencies.has("bar"));
});

test("should detect an unsafe import using data:text/javascript and throw a unsafe-import warning", () => {
  const expectedValue = "data:text/javascript;base64,Y29uc29sZS5sb2coJ2hlbGxvIHdvcmxkJyk7Cg==";

  const importNodes = [
    `import '${expectedValue}';`,
    `import('${expectedValue}');`
  ];

  importNodes.forEach((str) => {
    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isImportDeclaration)
      .execute(ast.body);

    assert.strictEqual(sastAnalysis.warnings().length, 1);

    const unsafeImport = sastAnalysis.getWarning("unsafe-import");
    assert.strictEqual(unsafeImport.value, expectedValue);
  });
});

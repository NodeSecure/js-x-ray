// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isImportDeclaration from "../../src/probes/isImportDeclaration.ts";
import { getSastAnalysis, parseScript } from "../helpers.ts";

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
    assert.strictEqual(unsafeImport!.value, expectedValue);
  });
});

test("should detect an unsafe import using file: and throw a unsafe-import warning", () => {
  const expectedValue = "file:///etc/passwd";

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
    assert.strictEqual(unsafeImport!.value, expectedValue);
  });
});

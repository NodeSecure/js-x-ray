// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript, mockedFunction } from "../utils/index.js";
import isLiteral from "../../src/probes/isLiteral.js";

test("should throw an unsafe-import because the hexadecimal string is equal to the core 'http' dependency", (tape) => {
  const str = "const foo = '68747470'";
  const ast = parseScript(str);

  const analyzeStringMock = mockedFunction();
  const sastAnalysis = getSastAnalysis(str, isLiteral);
  sastAnalysis.analysis.analyzeString = analyzeStringMock.callback.bind(analyzeStringMock);
  sastAnalysis.execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  tape.strictEqual(warning.kind, "unsafe-import");

  tape.true("http" in sastAnalysis.dependencies(), true);
  tape.true(analyzeStringMock.haveBeenCalledTimes(1));
  tape.true(analyzeStringMock.haveBeenCalledWith("http"));

  tape.end();
});

test("should throw an encoded-literal warning because the hexadecimal value is equal to 'require'", (tape) => {
  const str = "const _t = globalThis['72657175697265']";
  const ast = parseScript(str);

  const analyzeStringMock = mockedFunction();
  const sastAnalysis = getSastAnalysis(str, isLiteral);
  sastAnalysis.analysis.analyzeString = analyzeStringMock.callback.bind(analyzeStringMock);
  sastAnalysis.execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  tape.strictEqual(warning.value, "72657175697265");

  tape.true(analyzeStringMock.haveBeenCalledTimes(1));
  tape.true(analyzeStringMock.haveBeenCalledWith("require"));

  tape.end();
});

test("should not throw an encoded-literal warning because hexadecimal value is safe", (tape) => {
  const str = "const foo = '123456789'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral)
    .execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 0);

  tape.end();
});

test("should throw an encoded-literal warning because hexadecimal value is not safe", (tape) => {
  // Note: hexadecimal equal 'hello world'
  const str = "const foo = '68656c6c6f20776f726c64'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral)
    .execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  tape.strictEqual(warning.value, "68656c6c6f20776f726c64");

  tape.end();
});

test("should not throw any warnings without hexadecimal value (and should call analyzeLiteral of Analysis class)", (tape) => {
  const str = "const foo = 'hello world!'";
  const ast = parseScript(str);

  const analyzeLiteralMock = mockedFunction();
  const sastAnalysis = getSastAnalysis(str, isLiteral);
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 0);
  tape.true(analyzeLiteralMock.haveBeenCalledTimes(1));

  const astNode = analyzeLiteralMock.args[0];
  tape.strictEqual(astNode.value, "hello world!");

  tape.end();
});

test("should detect shady link", (tape) => {
  const str = "const foo = 'http://foobar.link'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  tape.strictEqual(warning.value, "http://foobar.link");

  tape.end();
});

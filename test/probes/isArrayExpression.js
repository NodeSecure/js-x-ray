// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript, mockedFunction } from "../utils/index.js";
import isArrayExpression from "../../src/probes/isArrayExpression.js";

test("it should trigger analyzeLiteral method one time", (tape) => {
  const str = "['foo']";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  const analyzeLiteralMock = mockedFunction();
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  tape.strictEqual(sastAnalysis.warnings().length, 0);

  tape.true(analyzeLiteralMock.haveBeenCalledTimes(1));
  const literalNode = analyzeLiteralMock.at(0);
  tape.strictEqual(literalNode.value, "foo");

  tape.end();
});

test("it should trigger analyzeLiteral method two times (ignoring the holey between)", (tape) => {
  const str = "[5, ,10]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  const analyzeLiteralMock = mockedFunction();
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  tape.true(analyzeLiteralMock.haveBeenCalledTimes(2));
  tape.strictEqual(analyzeLiteralMock.at(0).value, 5);
  tape.strictEqual(analyzeLiteralMock.at(2).value, 10);

  tape.end();
});

test("it should trigger analyzeLiteral one time (ignoring non-literal Node)", (tape) => {
  const str = "[5, () => void 0]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  const analyzeLiteralMock = mockedFunction();
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  tape.true(analyzeLiteralMock.haveBeenCalledTimes(1));
  tape.strictEqual(analyzeLiteralMock.at(0).value, 5);

  tape.end();
});

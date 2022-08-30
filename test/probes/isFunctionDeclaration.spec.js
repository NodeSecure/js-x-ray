// Require Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isFunctionDeclaration from "../../src/probes/isFunctionDeclaration.js";

// Require Third-party dependencies
import test from "tape";

test("should detect 1 function declaration", (tape) => {
  const str = `
  function foo() {}
  `;
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isFunctionDeclaration);

  tape.equal(analysis.idtypes.functionDeclaration, 1);

  tape.end();
});

test("should detect 0 function declaration", (tape) => {
  const str = `
  foo()
  `;
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isFunctionDeclaration);

  tape.equal(analysis.idtypes.functionDeclaration, 0);

  tape.end();
});

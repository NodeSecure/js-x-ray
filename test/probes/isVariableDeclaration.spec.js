// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isVariableDeclaration from "../../src/probes/isVariableDeclaration.js";

test("should detect and save all VariableDeclaration kinds", (tape) => {
  const str = "var foo; const a = 5; let b = 'foo';";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isVariableDeclaration)
    .execute(ast.body);

  tape.deepEqual(analysis.varkinds, {
    const: 1,
    let: 1,
    var: 1
  });

  tape.end();
});

test("should count the number of VariableDeclarator node", (tape) => {
  const str = "let a,b,c;";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isVariableDeclaration)
    .execute(ast.body);

  tape.strictEqual(analysis.idtypes.variableDeclarator, 3);

  tape.end();
});

test("should detect and save VariableDeclarator Identifier", (tape) => {
  const str = "let foobar = 5;";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isVariableDeclaration)
    .execute(ast.body);

  tape.deepEqual(analysis.identifiersName, [
    {
      name: "foobar",
      type: "variableDeclarator"
    }
  ]);

  tape.end();
});

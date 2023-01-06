// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isClassDeclaration from "../../src/probes/isClassDeclaration.js";

test("should detect two identifiers (class name and superClass name A.K.A extends)", (tape) => {
  const str = "class File extends Blob {}";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isClassDeclaration)
    .execute(ast.body);

  tape.deepEqual(analysis.identifiersName, [
    { name: "File", type: "class" },
    { name: "Blob", type: "class" }
  ]);

  tape.end();
});

test("should detect one identifier because there is no superClass (extension)", (tape) => {
  const str = "class File {}";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isClassDeclaration)
    .execute(ast.body);

  tape.deepEqual(analysis.identifiersName, [
    { name: "File", type: "class" }
  ]);

  tape.end();
});

test("should detect one identifier because superClass is not an Identifier but a CallExpression", (tape) => {
  const str = "class File extends (foo()) {}";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isClassDeclaration)
    .execute(ast.body);

  tape.deepEqual(analysis.identifiersName, [
    { name: "File", type: "class" }
  ]);

  tape.end();
});

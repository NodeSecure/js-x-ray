// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getVariableDeclarationIdentifiers } from "../src/index.js";
import {
  codeToAst
} from "./utils.js";

describe("getVariableDeclarationIdentifiers", () => {
  test("return empty array when the node is not a VariableDeclaration", () => {
    const [astNode] = codeToAst("foobar();");
    const iter = getVariableDeclarationIdentifiers(
      astNode
    );

    assert.deepEqual(Array.from(iter), []);
  });

  test("return the Identifier from VariableDeclaration", () => {
    const [astNode] = codeToAst("const a = 1;");
    const iter = getVariableDeclarationIdentifiers(
      astNode
    );
    const idNames = Array
      .from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["a"]);
  });

  test("return all Identifiers from VariableDeclaration", () => {
    const [astNode] = codeToAst("const a = 1, b = 2;");
    console.log(astNode);
    const iter = getVariableDeclarationIdentifiers(
      astNode
    );
    const idNames = Array
      .from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["a"]);
  });
});

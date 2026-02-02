// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { getCallExpressionIdentifier } from "../../src/estree/index.ts";
import { parseScript, getExpressionFromStatement } from "../helpers.ts";

test("given a JavaScript eval CallExpression then it must return eval", () => {
  const [astNode] = parseScript("eval(\"this\");").body;
  const nodeIdentifier = getCallExpressionIdentifier(getExpressionFromStatement(astNode));

  assert.strictEqual(nodeIdentifier, "eval");
});

test("given a Function(`...`)() Double CallExpression then it must return the Function literal identifier", () => {
  const [astNode] = parseScript("Function(\"return this\")();").body;
  const nodeIdentifier = getCallExpressionIdentifier(getExpressionFromStatement(astNode));

  assert.strictEqual(nodeIdentifier, "Function");
});

test(`given a Function("...")() Double CallExpression with resolveCallExpression options disabled
then it must return null`, () => {
  const [astNode] = parseScript("Function(\"return this\")();").body;
  const nodeIdentifier = getCallExpressionIdentifier(
    getExpressionFromStatement(astNode),
    { resolveCallExpression: false }
  );

  assert.strictEqual(nodeIdentifier, null);
});

test("given a JavaScript AssignmentExpression then it must return null", () => {
  const [astNode] = parseScript("foo = 10;").body;
  const nodeIdentifier = getCallExpressionIdentifier(getExpressionFromStatement(astNode));

  assert.strictEqual(nodeIdentifier, null);
});

test(`given a require statement immediatly invoked with resolveCallExpression options enabled
then it must return require literal identifier`, () => {
  const [astNode] = parseScript("require('foo')();").body;
  const nodeIdentifier = getCallExpressionIdentifier(
    getExpressionFromStatement(astNode),
    { resolveCallExpression: true }
  );

  assert.strictEqual(nodeIdentifier, "require");
});

test(`given a require statement immediatly invoked with resolveCallExpression options disabled
then it must return null`, () => {
  const [astNode] = parseScript("require('foo')();").body;
  const nodeIdentifier = getCallExpressionIdentifier(
    getExpressionFromStatement(astNode),
    { resolveCallExpression: false }
  );

  assert.strictEqual(nodeIdentifier, null);
});

test(`given two CallExpression with a MemberExpression coming first
  then it must return the full identifier path`, () => {
  const [astNode] = parseScript("foo.bar().yo();").body;
  const nodeIdentifier = getCallExpressionIdentifier(
    getExpressionFromStatement(astNode),
    { resolveCallExpression: true }
  );

  assert.strictEqual(nodeIdentifier, "foo.bar.yo");
});

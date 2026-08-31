// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { createTracer } from "./utils.ts";

test("resolveLiteralIdentifier returns the tracked value of a string literal assignment", () => {
  const helpers = createTracer(false);
  helpers.walkOnCode("const foo = 'bar';");

  assert.strictEqual(helpers.tracer.resolveLiteralIdentifier("foo"), "bar");
});

test("resolveLiteralIdentifier returns the stringified value of a numeric literal assignment", () => {
  const helpers = createTracer(false);
  helpers.walkOnCode("const rounds = 10;");

  assert.strictEqual(helpers.tracer.resolveLiteralIdentifier("rounds"), "10");
});

test("resolveLiteralIdentifier returns null for an identifier that was never assigned a literal", () => {
  const helpers = createTracer(false);

  assert.strictEqual(helpers.tracer.resolveLiteralIdentifier("unknown"), null);
});

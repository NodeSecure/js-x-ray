// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { createTracer } from "../utils.js";

test("it should be able to Trace a require Assignment (using a global variable)", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const test = globalThis;
    const foo = test.require;
    foo("http");
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  assert.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require",
    assignmentMemory: ["foo"]
  });
  assert.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "require");
  assert.strictEqual(eventOne.id, "foo");
});

test("it should be able to Trace a require Assignment (using a MemberExpression)", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const foo = require.resolve;
    foo("http");
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  assert.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require.resolve",
    assignmentMemory: ["foo"]
  });
  assert.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "require.resolve");
  assert.strictEqual(eventOne.id, "foo");
});

test("it should be able to Trace a global Assignment using an ESTree ObjectPattern", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const { process: yoo } = globalThis;

    const boo = yoo.mainModule.require;
  `);

  const boo = helpers.tracer.getDataFromIdentifier("boo");

  assert.deepEqual(boo, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["yoo", "boo"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "process");
  assert.strictEqual(eventOne.id, "yoo");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  assert.strictEqual(eventTwo.id, "boo");
});

test("it should be able to Trace an Unsafe Function() Assignment using an ESTree ObjectPattern", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const { process: yoo } = Function("return this")();

    const boo = yoo.mainModule.require;
  `);

  const boo = helpers.tracer.getDataFromIdentifier("boo");

  assert.deepEqual(boo, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["yoo", "boo"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "process");
  assert.strictEqual(eventOne.id, "yoo");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  assert.strictEqual(eventTwo.id, "boo");
});

test("it should be able to Trace a require Assignment with atob", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const xo = atob;
    const yo = 'b3M=';
    const ff = xo(yo);
  `);
  assert.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "atob");
  assert.strictEqual(eventOne.id, "xo");

  assert.ok(helpers.tracer.literalIdentifiers.has("ff"));
  assert.strictEqual(helpers.tracer.literalIdentifiers.get("ff"), "os");
});

test("it should be able to Trace a global assignment using a LogicalExpression", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    var root = freeGlobal || freeSelf || Function('return this')();
    const foo = root.require;
    foo("http");
  `);
  const foo = helpers.tracer.getDataFromIdentifier("foo");
  assert.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require",
    assignmentMemory: ["foo"]
  });
  assert.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "require");
  assert.strictEqual(eventOne.id, "foo");
});

test("it should be able to Trace assignment of process.getBuiltinModule", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    if (globalThis.process?.getBuiltinModule) {
      const foo = globalThis.process.getBuiltinModule;
      const fs = foo('fs');
    }
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  assert.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "process.getBuiltinModule",
    assignmentMemory: ["foo"]
  });
  assert.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "process.getBuiltinModule");
  assert.strictEqual(eventOne.id, "foo");

  assert.strictEqual(
    helpers.tracer.getDataFromIdentifier("globalThis.process.getBuiltinModule"),
    null
  );

  const getBuiltinModule = helpers.tracer.getDataFromIdentifier(
    "globalThis.process.getBuiltinModule",
    { removeGlobalIdentifier: true }
  );
  assert.deepEqual(getBuiltinModule, {
    name: "require",
    identifierOrMemberExpr: "process.getBuiltinModule",
    assignmentMemory: ["foo"]
  });
});

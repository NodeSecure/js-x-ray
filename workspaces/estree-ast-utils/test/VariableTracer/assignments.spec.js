
// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { createTracer } from "../utils.js";

test("it should be able to Trace a require Assignment (using a global variable)", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const test = globalThis;
    const foo = test.require;
    foo("http");
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  tape.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require",
    assignmentMemory: ["foo"]
  });
  tape.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "require");
  tape.strictEqual(eventOne.id, "foo");

  tape.end();
});

test("it should be able to Trace a require Assignment (using a MemberExpression)", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const foo = require.resolve;
    foo("http");
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  tape.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require.resolve",
    assignmentMemory: ["foo"]
  });
  tape.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "require.resolve");
  tape.strictEqual(eventOne.id, "foo");

  tape.end();
});

test("it should be able to Trace a global Assignment using an ESTree ObjectPattern", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const { process: yoo } = globalThis;

    const boo = yoo.mainModule.require;
  `);

  const boo = helpers.tracer.getDataFromIdentifier("boo");

  tape.deepEqual(boo, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["yoo", "boo"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "process");
  tape.strictEqual(eventOne.id, "yoo");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  tape.strictEqual(eventTwo.id, "boo");

  tape.end();
});

test("it should be able to Trace an Unsafe Function() Assignment using an ESTree ObjectPattern", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const { process: yoo } = Function("return this")();

    const boo = yoo.mainModule.require;
  `);

  const boo = helpers.tracer.getDataFromIdentifier("boo");

  tape.deepEqual(boo, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["yoo", "boo"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "process");
  tape.strictEqual(eventOne.id, "yoo");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  tape.strictEqual(eventTwo.id, "boo");

  tape.end();
});

test("it should be able to Trace a require Assignment with atob", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const xo = atob;
    const yo = 'b3M=';
    const ff = xo(yo);
  `);
  tape.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "atob");
  tape.strictEqual(eventOne.id, "xo");

  tape.true(helpers.tracer.literalIdentifiers.has("ff"));
  tape.strictEqual(helpers.tracer.literalIdentifiers.get("ff"), "os");

  tape.end();
});

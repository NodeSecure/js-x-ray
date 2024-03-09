// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { createTracer } from "../utils.js";

test("getDataFromIdentifier must return primitive null is there is no kwown traced identifier", () => {
  const helpers = createTracer(true);

  const result = helpers.tracer.getDataFromIdentifier("foobar");

  assert.strictEqual(result, null);
});

test("it should be able to Trace a malicious code with Global, BinaryExpr, Assignments and Hexadecimal", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    var foo;
    const g = eval("this");
    const p = g["pro" + "cess"];

    const evil = p["mainMod" + "ule"][unhex("72657175697265")];
    const work = evil(unhex("2e2f746573742f64617461"))
  `);

  const evil = helpers.tracer.getDataFromIdentifier("evil");
  assert.deepEqual(evil, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["p", "evil"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "process");
  assert.strictEqual(eventOne.id, "p");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  assert.strictEqual(eventTwo.id, "evil");
});

test("it should be able to Trace a malicious CallExpression by recombining segments of the MemberExpression", () => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const g = global.process;
    const r = g.mainModule;
    const c = r.require;
    c("http");
    r.require("fs");
  `);

  const evil = helpers.tracer.getDataFromIdentifier("r.require");
  assert.deepEqual(evil, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["g", "r", "c"]
  });
  assert.strictEqual(assignments.length, 3);

  const [eventOne, eventTwo, eventThree] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "process");
  assert.strictEqual(eventOne.id, "g");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule");
  assert.strictEqual(eventTwo.id, "r");

  assert.strictEqual(eventThree.identifierOrMemberExpr, "process.mainModule.require");
  assert.strictEqual(eventThree.id, "c");
});

test("given a MemberExpression segment that doesn't match anything then it should return null", () => {
  const helpers = createTracer(true);

  const result = helpers.tracer.getDataFromIdentifier("foo.bar");
  assert.strictEqual(result, null);
});

test("it should be able to Trace a require using Function.prototype.call", () => {
  const helpers = createTracer();
  helpers.tracer.trace("http");
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
  const proto = Function.prototype.call.call(require, require, "http");
  `);

  const proto = helpers.tracer.getDataFromIdentifier("proto");

  assert.strictEqual(proto, null);
  assert.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "http");
  assert.strictEqual(eventOne.id, "proto");
});

test("it should be able to Trace an unsafe crypto.createHash using Function.prototype.call reassignment", () => {
  const helpers = createTracer(true);
  helpers.tracer.trace("crypto.createHash", { followConsecutiveAssignment: true });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
  const aA = Function.prototype.call;
  const bB = require;

  const crr = aA.call(bB, bB, "crypto");
  const createHashBis = crr.createHash;
  createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");
  assert.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["crr", "createHashBis"]
  });

  assert.strictEqual(helpers.tracer.importedModules.has("crypto"), true);
  assert.strictEqual(assignments.length, 3);

  const [eventOne, eventTwo, eventThree] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "require");
  assert.strictEqual(eventOne.id, "bB");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "crypto");
  assert.strictEqual(eventTwo.id, "crr");

  assert.strictEqual(eventThree.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventThree.id, "createHashBis");
});

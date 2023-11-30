// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { createTracer } from "../utils.js";

test("getDataFromIdentifier must return primitive null is there is no kwown traced identifier", (tape) => {
  const helpers = createTracer(true);

  const result = helpers.tracer.getDataFromIdentifier("foobar");

  tape.strictEqual(result, null);
  tape.end();
});

test("it should be able to Trace a malicious code with Global, BinaryExpr, Assignments and Hexadecimal", (tape) => {
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
  tape.deepEqual(evil, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["p", "evil"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "process");
  tape.strictEqual(eventOne.id, "p");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  tape.strictEqual(eventTwo.id, "evil");

  tape.end();
});

test("it should be able to Trace a malicious CallExpression by recombining segments of the MemberExpression", (tape) => {
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
  tape.deepEqual(evil, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["g", "r", "c"]
  });
  tape.strictEqual(assignments.length, 3);

  const [eventOne, eventTwo, eventThree] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "process");
  tape.strictEqual(eventOne.id, "g");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule");
  tape.strictEqual(eventTwo.id, "r");

  tape.strictEqual(eventThree.identifierOrMemberExpr, "process.mainModule.require");
  tape.strictEqual(eventThree.id, "c");

  tape.end();
});

test("given a MemberExpression segment that doesn't match anything then it should return null", (tape) => {
  const helpers = createTracer(true);

  const result = helpers.tracer.getDataFromIdentifier("foo.bar");
  tape.strictEqual(result, null);

  tape.end();
});

test("it should be able to Trace a require using Function.prototype.call", (tape) => {
  const helpers = createTracer();
  helpers.tracer.trace("http");
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
  const proto = Function.prototype.call.call(require, require, "http");
  `);

  const proto = helpers.tracer.getDataFromIdentifier("proto");

  tape.strictEqual(proto, null);
  tape.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "http");
  tape.strictEqual(eventOne.id, "proto");

  tape.end();
});

test("it should be able to Trace an unsafe crypto.createHash using Function.prototype.call reassignment", (tape) => {
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
  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["crr", "createHashBis"]
  });

  tape.strictEqual(helpers.tracer.importedModules.has("crypto"), true);
  tape.strictEqual(assignments.length, 3);

  const [eventOne, eventTwo, eventThree] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "require");
  tape.strictEqual(eventOne.id, "bB");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto");
  tape.strictEqual(eventTwo.id, "crr");

  tape.strictEqual(eventThree.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventThree.id, "createHashBis");

  tape.end();
});

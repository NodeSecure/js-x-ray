// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { createTracer } from "./utils.js";

test("getDataFromIdentifier must return primitive null is there is no kwown traced identifier", () => {
  const helpers = createTracer(true);

  const result = helpers.tracer.getDataFromIdentifier("foobar");

  assert.strictEqual(result, null);
});

test("it should trace re-assignment from a module import using /promises", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("fs.readFile", {
    followConsecutiveAssignment: true,
    moduleName: "fs"
  });
  helpers.walkOnCode(`
    import { readFile } from "fs/promises";

    const foobar = readFile;
    const buf = await foobar("test.txt");
    console.log(buf);
  `);

  const result = helpers.tracer.getDataFromIdentifier("foobar");

  assert.deepEqual(result, {
    assignmentMemory: [
      {
        type: "AliasBinding",
        name: "readFile"
      },
      {
        type: "AliasBinding",
        name: "foobar"
      }
    ],
    identifierOrMemberExpr: "fs.readFile",
    name: "fs.readFile"
  });
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
    assignmentMemory: [{
      type: "AliasBinding",
      name: "p"
    }, {
      type: "AliasBinding",
      name: "evil"
    }]
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
    assignmentMemory: [{
      type: "AliasBinding",
      name: "g"
    }, {
      type: "AliasBinding",
      name: "r"
    }, {
      type: "AliasBinding",
      name: "c"
    }]
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
    assignmentMemory: [{
      type: "AliasBinding",
      name: "crr"
    }, {
      type: "AliasBinding",
      name: "createHashBis"
    }]
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

test("should be able to trace the return value of a traced function", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.hostname", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import { hostname } from "os";

    const host = hostname();
    console.log(host);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.hostname")?.assignmentMemory, [
    { type: "AliasBinding", name: "hostname" }, {
      type: "ReturnValueAssignment",
      name: "host"
    }]);
});

test("should be able to follow the return value of a traced function in an object", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.hostname", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import { hostname } from "os";

    const host = {x: hostname()};
    console.log(host);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.hostname")?.assignmentMemory, [
    { type: "AliasBinding", name: "hostname" },
    {
      type: "ReturnValueAssignment",
      name: "host"
    }]);
});

test("it should be able to trace a the return value of a traced function in a nested object", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.hostname", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import { hostname } from "os";

    const host = {x: null, y: {z: hostname()}};
    console.log(host);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.hostname")?.assignmentMemory, [
    { type: "AliasBinding", name: "hostname" },
    {
      type: "ReturnValueAssignment",
      name: "host"
    }]);
});

test("should be able to trace the return value of a traced function when the return value is spreaded", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.userInfo", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import os from "os";

    const user = {...os.userInfo()};
    console.log(user);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.userInfo")?.assignmentMemory, [{
    type: "ReturnValueAssignment",
    name: "user"
  }]);
});

test("should be able to trace a property access on the return value of a traced function", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.userInfo", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import os from "os";

    const user = {x: os.userInfo().name};

    console.log(user);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.userInfo")?.assignmentMemory, [{
    type: "ReturnValueAssignment",
    name: "user"
  }]);
});

test("it should be able to trace a the return value of a traced function in an array", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.hostname", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import { hostname } from "os";

    const host = [hostname()];
    console.log(host);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.hostname")?.assignmentMemory, [
    { type: "AliasBinding", name: "hostname" },
    {
      type: "ReturnValueAssignment",
      name: "host"
    }]);
});

test("should be able to trace the return value of a traced function in a nested array", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.hostname", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import { hostname } from "os";

    const host = [null,[1, hostname()]];
    console.log(host);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.hostname")?.assignmentMemory, [

    { type: "AliasBinding", name: "hostname" },
    {
      type: "ReturnValueAssignment",
      name: "host"
    }]);
});

test("should be able to trace the return value of a traced function in an array when the return value is spreaded", () => {
  const helpers = createTracer(false);
  helpers.tracer.trace("os.userInfo", {
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true,
    moduleName: "os"
  });

  helpers.walkOnCode(`
    import os from "os";

    const user = [...os.userInfo()];
    console.log(user);
  `);

  assert.deepEqual(helpers.tracer.getDataFromIdentifier("os.userInfo")?.assignmentMemory, [{
    type: "ReturnValueAssignment",
    name: "user"
  }]);
});

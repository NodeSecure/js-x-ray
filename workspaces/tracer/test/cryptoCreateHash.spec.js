// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { createTracer } from "./utils.js";

test("it should be able to Trace crypto.createHash when imported with an ESTree ImportNamespaceSpecifier (ESM)", () => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    import fs from "fs";
    import * as cryptoBis from "crypto";

    const createHashBis = cryptoBis.createHash;
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  assert.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["cryptoBis", "createHashBis"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "crypto");
  assert.strictEqual(eventOne.id, "cryptoBis");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventTwo.id, "createHashBis");
});

test("it should be able to Trace createHash when required (CommonJS) and destructured with an ESTree ObjectPattern", () => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
  const assignments = helpers.getAssignmentArray();

  /**
   * This is an ObjectPattern:
   * const { createHash } = ...
   */
  helpers.walkOnCode(`
    const { createHash } = require("crypto");

    const createHashBis = createHash;
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  assert.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHash", "createHashBis"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventOne.id, "createHash");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventTwo.id, "createHashBis");
});

test("it should be able to Trace crypto.createHash when imported with an ESTree ImportSpecifier (ESM)", () => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    import { createHash } from "node:crypto";

    const createHashBis = createHash;
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  assert.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHash", "createHashBis"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventOne.id, "createHash");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventTwo.id, "createHashBis");
});

test("it should be able to Trace crypto.createHash with CommonJS require and with a computed method with a Literal", () => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const fs = require("fs");
    const crypto = require("node:crypto");

    const id = "createHash";
    const createHashBis = crypto[id];
    createHashBis("md5");
  `);

  assert.strictEqual(helpers.tracer.importedModules.has("crypto"), true);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  assert.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHashBis"]
  });
  assert.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  assert.strictEqual(eventOne.identifierOrMemberExpr, "crypto");
  assert.strictEqual(eventOne.id, "crypto");

  assert.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  assert.strictEqual(eventTwo.id, "createHashBis");
});

test("it should not detect variable assignment since the crypto module is not imported", () => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });

  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const crypto = {
      createHash() {}
    }
    const _t = crypto.createHash;
    _t("md5");
  `);

  assert.strictEqual(helpers.tracer.importedModules.has("crypto"), false);
  assert.strictEqual(assignments.length, 0);
});

test("it should return null because crypto.createHash is not imported from a module", () => {
  const helpers = createTracer(true);
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });

  helpers.walkOnCode(`
    const crypto = {
      createHash() {}
    }
    const evil = crypto.createHash;
    evil('md5');
  `);

  const result = helpers.tracer.getDataFromIdentifier("crypto.createHash");
  assert.strictEqual(result, null);
});

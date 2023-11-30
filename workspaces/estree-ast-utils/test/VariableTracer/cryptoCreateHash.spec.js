// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { createTracer } from "../utils.js";

test("it should be able to Trace crypto.createHash when imported with an ESTree ImportNamespaceSpecifier (ESM)", (tape) => {
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

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["cryptoBis", "createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto");
  tape.strictEqual(eventOne.id, "cryptoBis");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});

test("it should be able to Trace createHash when required (CommonJS) and destructured with an ESTree ObjectPattern", (tape) => {
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

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHash", "createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventOne.id, "createHash");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});

test("it should be able to Trace crypto.createHash when imported with an ESTree ImportSpecifier (ESM)", (tape) => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    import { createHash } from "crypto";

    const createHashBis = createHash;
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHash", "createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventOne.id, "createHash");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});

test("it should be able to Trace crypto.createHash with CommonJS require and with a computed method with a Literal", (tape) => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const fs = require("fs");
    const crypto = require("crypto");

    const id = "createHash";
    const createHashBis = crypto[id];
    createHashBis("md5");
  `);

  tape.strictEqual(helpers.tracer.importedModules.has("crypto"), true);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto");
  tape.strictEqual(eventOne.id, "crypto");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});

test("it should not detect variable assignment since the crypto module is not imported", (tape) => {
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

  tape.strictEqual(helpers.tracer.importedModules.has("crypto"), false);
  tape.strictEqual(assignments.length, 0);

  tape.end();
});

test("it should return null because crypto.createHash is not imported from a module", (tape) => {
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
  tape.strictEqual(result, null);

  tape.end();
});

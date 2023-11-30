// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { notNullOrUndefined } from "../../src/utils/index.js";

test("given a null or undefined primitive value then it must always return false", (tape) => {
  tape.strictEqual(notNullOrUndefined(null), false, "null primitive value should return false");
  tape.strictEqual(notNullOrUndefined(void 0), false, "undefined primitive value should return false");

  tape.end();
});

test("given values (primitive or objects) that are not null or undefined then it must always return true", (tape) => {
  const valuesToAssert = ["", 1, true, Symbol("foo"), {}, [], /^xd/g];
  for (const value of valuesToAssert) {
    tape.strictEqual(notNullOrUndefined(value), true);
  }

  tape.end();
});

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { isEvilIdentifierPath } from "../../src/utils/index.js";

test("given a random prototype method name then it should return false", (tape) => {
  const result = isEvilIdentifierPath(
    "Function.prototype.foo"
  );

  tape.strictEqual(result, false);

  tape.end();
});

test("given a list of evil identifiers it should always return true", (tape) => {
  const evilIdentifiers = [
    "Function.prototype.bind",
    "Function.prototype.call",
    "Function.prototype.apply"
  ];
  for (const identifier of evilIdentifiers) {
    tape.strictEqual(isEvilIdentifierPath(identifier), true);
  }

  tape.end();
});

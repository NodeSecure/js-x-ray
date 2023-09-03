// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { rootLocation } from "../src/utils.js";
import { generateWarning } from "../src/warnings.js";

test("Given an encoded-literal kind it should generate a warning with deep location array", () => {
  const result = generateWarning("encoded-literal", {
    location: rootLocation()
  });

  assert.deepEqual(result, {
    kind: "encoded-literal",
    value: null,
    location: [
      [[0, 0], [0, 0]]
    ],
    i18n: "sast_warnings.encoded_literal",
    severity: "Information"
  });
});

test("Given a weak-crypto kind it should generate a warning with value, simple location and experimental flag", () => {
  const result = generateWarning("weak-crypto", {
    value: "md5",
    location: rootLocation(),
    file: "hello.js"
  });

  assert.deepEqual(result, {
    kind: "weak-crypto",
    value: "md5",
    file: "hello.js",
    location: [
      [0, 0], [0, 0]
    ],
    i18n: "sast_warnings.weak_crypto",
    severity: "Information",
    experimental: true
  });
});

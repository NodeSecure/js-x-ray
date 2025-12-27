// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { rootLocation } from "../src/utils/index.ts";
import { generateWarning } from "../src/warnings.ts";

test("Given an encoded-literal kind it should generate a warning with deep location array", () => {
  const result = generateWarning("encoded-literal", {
    value: null,
    location: rootLocation()
  });

  assert.deepEqual(result, {
    experimental: false,
    kind: "encoded-literal",
    value: null,
    source: "JS-X-Ray",
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
    source: "JS-X-Ray",
    location: [
      [0, 0], [0, 0]
    ],
    i18n: "sast_warnings.weak_crypto",
    severity: "Information",
    experimental: false
  });
});

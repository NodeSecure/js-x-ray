// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { rootLocation } from "../src/utils.js";
import { generateWarning } from "../src/warnings.js";

test("Given an encoded-literal kind it should generate a warning with deep location array", (tape) => {
  const result = generateWarning("encoded-literal", {
    location: rootLocation()
  });

  tape.deepEqual(result, {
    kind: "encoded-literal",
    value: null,
    location: [
      [[0, 0], [0, 0]]
    ],
    i18n: "sast_warnings.encoded_literal",
    severity: "Information"
  });

  tape.end();
});

test("Given a weak-crypto kind it should generate a warning with value, simple location and experimental flag", (tape) => {
  const result = generateWarning("weak-crypto", {
    value: "md5",
    location: rootLocation(),
    file: "hello.js"
  });

  tape.deepEqual(result, {
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

  tape.end();
});

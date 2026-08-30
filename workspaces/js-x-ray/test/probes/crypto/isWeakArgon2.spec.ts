// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../../src/AstAnalyser.ts";

function analyse(code: string) {
  return new AstAnalyser({
    optionalWarnings: ["crypto.weak-argon2"]
  }).analyse(code);
}

describe("isWeakArgon2", () => {
  describe("weak-algorithm", () => {
    it("should warn when the argon2d variant is used, even with strong parameters", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2d", { memory: 47104, passes: 1, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.weak-argon2");
      assert.strictEqual(outputWarnings[0].value, "weak-algorithm");
    });
  });

  describe("low-params", () => {
    it("should warn when memory is far below the lowest OWASP row", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 8, passes: 1, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should warn with crypto.argon2Sync as well", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2Sync("argon2id", { memory: 8, passes: 1 });
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should warn for argon2i with passes=1 regardless of how much memory is allocated", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2i", { memory: 47104, passes: 1, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should warn for argon2i with passes=2 (OWASP forbids that row for Argon2i)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2i", { memory: 19456, passes: 2, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should warn for argon2i with passes=3 when memory is below 12288", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2i", { memory: 9216, passes: 3, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should warn when parameter keys are quoted string literals", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { "memory": 8, "passes": 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should warn when parameter keys are computed string literals", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { ["memory"]: 8, ["passes"]: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-params");
    });

    it("should not warn for argon2i when params meet the passes=3 row (m=12288)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2i", { memory: 12288, passes: 3, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn for argon2i when params meet the passes=5 row (m=7168)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2i", { memory: 7168, passes: 5, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn for argon2id with passes=1, which argon2i cannot use", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 47104, passes: 1, parallelism: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("short-nonce", () => {
    it("should warn when nonce is a string literal shorter than 16 chars", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 47104, passes: 1, nonce: "12345678" }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "short-nonce");
    });
  });

  describe("hardcoded-nonce", () => {
    it("should warn when nonce is a string literal of 16 chars or more", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 47104, passes: 1, nonce: "0123456789abcdef" }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "hardcoded-nonce");
    });
  });

  describe("combined warnings", () => {
    it("should emit both low-params and short-nonce", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 8, passes: 1, nonce: "salt" }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.deepStrictEqual(
        outputWarnings.map((warning) => warning.value).sort(),
        ["low-params", "short-nonce"]
      );
    });

    it("should emit both weak-algorithm and low-params", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2d", { memory: 8, passes: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.deepStrictEqual(
        outputWarnings.map((warning) => warning.value).sort(),
        ["low-params", "weak-algorithm"]
      );
    });
  });

  describe("values that cannot be resolved statically", () => {
    it("should not warn when the options argument is a variable", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", options, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the options argument is missing", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id");
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the algorithm is a variable", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2(algorithm, { memory: 8, passes: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when passes is a variable", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 8, passes: iterations }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when a key is computed from a variable", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { [memory]: 8, [passes]: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when parameters come from a spread and cannot all be read", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { ...defaults, memory: 8 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("no warning (proper usage)", () => {
    it("should not warn for argon2id with OWASP parameters and a random nonce", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", {
          message: password,
          nonce: crypto.randomBytes(16),
          parallelism: 1,
          tagLength: 32,
          memory: 19456,
          passes: 2
        }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when nonce is a variable", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2id", { memory: 47104, passes: 1, nonce: salt }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the crypto module is not imported", () => {
      const code = `
        argon2("argon2d", { memory: 8, passes: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn for an unrelated object exposing an argon2 method", () => {
      const code = `
        import crypto from 'crypto';
        const fake = { argon2: () => {} };
        fake.argon2("argon2d", { memory: 8, passes: 1 }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when crypto.weak-argon2 is not enabled", () => {
      const code = `
        import crypto from 'crypto';
        crypto.argon2("argon2d", { memory: 8, passes: 1, nonce: "salt" }, (err, tag) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});

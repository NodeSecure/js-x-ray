// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

const safeParams = [
  "message: \"password\"",
  "nonce: crypto.randomBytes(16)",
  "memory: 47104",
  "passes: 1",
  "parallelism: 1",
  "tagLength: 64"
].join(", ");

function makeCode(
  algorithm: string,
  paramsOverride?: string,
  fn = "argon2"
) {
  const params = paramsOverride ?? safeParams;

  return `
    import crypto from "crypto";
    crypto.${fn}("${algorithm}", { ${params} })
  `;
}

describe("isWeakArgon2", () => {
  describe("wrong-algorithm", () => {
    it("should warn when algorithm is argon2d", () => {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2d"));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-argon2");
      assert.strictEqual(outputWarnings[0].value, "wrong-algorithm : argon2d");
    });

    it("should warn when algorithm is argon2i", () => {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2i"));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-argon2");
      assert.strictEqual(outputWarnings[0].value, "wrong-algorithm : argon2i");
    });

    it("should warn when algorithm is an identifier assigned to argon2d", () => {
      const code = `
        import crypto from "crypto";
        const algo = "argon2d";
        crypto.argon2(algo, { ${safeParams} })
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-argon2");
      assert.strictEqual(outputWarnings[0].value, "wrong-algorithm : argon2d");
    });

    it("should not warn when algorithm is an identifier assigned to argon2id", () => {
      const code = `
        import crypto from "crypto";
        const algo = "argon2id";
        crypto.argon2(algo, { ${safeParams} })
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when algorithm is an unresolvable identifier", () => {
      const code = `
        import crypto from "crypto";
        crypto.argon2(unknownVar, { ${safeParams} })
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when algorithm is argon2id", () => {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id"));

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("weak-parameters", () => {
    it("should warn when memory is below all OWASP minimums (memory < 7168)", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 512, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "weak-parameters");
    });

    it("should warn when passes is below OWASP minimum (memory=7168, passes=4)", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 7168, passes: 4, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "weak-parameters");
    });

    it("should not warn when params meet OWASP minimum (memory=7168, passes=5, parallelism=1)", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 7168, passes: 5, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params));

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when params meet OWASP minimum (memory=47104, passes=1, parallelism=1)", () => {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id"));

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when params meet OWASP minimum (memory=19456, passes=2, parallelism=1)", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 19456, passes: 2, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params));

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should warn when passes is below OWASP minimum (memory=19456, passes=1)", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 19456, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "weak-parameters");
    });

    it("should warn when using argon2Sync with weak parameters", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 512, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params, "argon2Sync"));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "weak-parameters");
    });
  });

  describe("hardcoded-nonce", () => {
    it("should warn when nonce is a string literal", () => {
      const params = [
        "message: \"password\"",
        "nonce: \"hardcoded-salt\"",
        "memory: 47104, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id", params));

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "hardcoded-nonce");
    });

    it("should not warn when nonce is crypto.randomBytes()", () => {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id"));

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when nonce is a variable reference", () => {
      const code = `
        import crypto from "crypto";
        const salt = crypto.randomBytes(16);
        crypto.argon2("argon2id", {
          message: "password", nonce: salt,
          memory: 47104, passes: 1,
          parallelism: 1, tagLength: 64
        })
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("combined warnings", () => {
    it("should emit both wrong-algorithm and weak-parameters warnings", () => {
      const params = [
        "message: \"password\"",
        "nonce: crypto.randomBytes(16)",
        "memory: 512, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2d", params));

      assert.strictEqual(outputWarnings.length, 2);
      const values = outputWarnings.map((w) => w.value);
      assert.ok(values.includes("wrong-algorithm : argon2d"));
      assert.ok(values.includes("weak-parameters"));
    });

    it("should emit both wrong-algorithm and hardcoded-nonce warnings", () => {
      const params = [
        "message: \"password\"",
        "nonce: \"salt\"",
        "memory: 47104, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2d", params));

      assert.strictEqual(outputWarnings.length, 2);
      const values = outputWarnings.map((w) => w.value);
      assert.ok(values.includes("wrong-algorithm : argon2d"));
      assert.ok(values.includes("hardcoded-nonce"));
    });

    it("should emit all three warnings simultaneously", () => {
      const params = [
        "message: \"password\"",
        "nonce: \"salt\"",
        "memory: 512, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2d", params));

      assert.strictEqual(outputWarnings.length, 3);
      const values = outputWarnings.map((w) => w.value);
      assert.ok(values.includes("wrong-algorithm : argon2d"));
      assert.ok(values.includes("weak-parameters"));
      assert.ok(values.includes("hardcoded-nonce"));
    });
  });

  describe("no warnings (proper usage)", () => {
    it("should not warn with proper argon2id usage", () => {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(makeCode("argon2id"));

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when crypto module is not imported", () => {
      const code = `
        const crypto = { argon2() {} };
        crypto.argon2("argon2d", {
          message: "password", nonce: "salt",
          memory: 512, passes: 1,
          parallelism: 1, tagLength: 64
        })
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-argon2"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when weak-argon2 is not enabled", () => {
      const params = [
        "message: \"password\"",
        "nonce: \"salt\"",
        "memory: 512, passes: 1, parallelism: 1, tagLength: 64"
      ].join(", ");
      const { warnings: outputWarnings } = new AstAnalyser()
        .analyse(makeCode("argon2d", params));

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});

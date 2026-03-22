// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

describe("isWeakScrypt", () => {
  describe("short-salt", () => {
    it("should warn when salt is a short string literal (less than 16 chars)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, "short", 64, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-scrypt");
      assert.strictEqual(outputWarnings[0].value, "short-salt");
    });

    it("should warn when salt is an empty string literal", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, "", 64, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-scrypt");
      assert.strictEqual(outputWarnings[0].value, "short-salt");
    });
  });

  describe("hardcoded-salt", () => {
    it("should warn when salt is a hardcoded string literal (16 chars or more)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, "this-is-a-long-hardcoded-salt", 64, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-scrypt");
      assert.strictEqual(outputWarnings[0].value, "hardcoded-salt");
    });
  });

  describe("low-cost", () => {
    it("should warn when cost option is below 16384", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, salt, 64, { cost: 1024 }, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-scrypt");
      assert.strictEqual(outputWarnings[0].value, "low-cost");
    });

    it("should not warn when cost option is 16384 or above", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, salt, 64, { cost: 16384 }, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("combined warnings", () => {
    it("should emit both short-salt and low-cost warnings", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, "abc", 64, { cost: 1024 }, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 2);
      const values = outputWarnings.map((w) => w.value);
      assert.ok(values.includes("short-salt"));
      assert.ok(values.includes("low-cost"));
    });
  });

  describe("no warning (proper usage)", () => {
    it("should not warn when salt is a variable", () => {
      const code = `
        import crypto from 'crypto';
        const salt = crypto.randomBytes(16);
        crypto.scrypt(password, salt, 64, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when crypto module is not imported", () => {
      const code = `
        const crypto = { scrypt() {} };
        crypto.scrypt(password, "short", 64, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-scrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when weak-scrypt is not enabled", () => {
      const code = `
        import crypto from 'crypto';
        crypto.scrypt(password, "short", 64, (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});

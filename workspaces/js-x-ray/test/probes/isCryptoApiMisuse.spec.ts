// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

describe("isCryptoApiMisuse probe", () => {
  describe("low iteration count", () => {
    it("should detect crypto.pbkdf2Sync with low iterations (member expression)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', 'longenoughsalt', 1000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const iterationWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("iterations")
      );
      assert.strictEqual(iterationWarnings.length, 1);
      assert.ok(iterationWarnings[0].value?.includes("1000 iterations"));
    });

    it("should detect crypto.pbkdf2 with low iterations (member expression)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2('password', 'longenoughsalt', 500, 64, 'sha512', (err, key) => {});
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const iterationWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("iterations")
      );
      assert.strictEqual(iterationWarnings.length, 1);
      assert.ok(iterationWarnings[0].value?.includes("500 iterations"));
    });

    it("should detect crypto.pbkdf2Sync with destructured import and low iterations", () => {
      const code = `
        const { pbkdf2Sync } = require('crypto');
        pbkdf2Sync('password', 'longenoughsalt', 10, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const iterationWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("iterations")
      );
      assert.strictEqual(iterationWarnings.length, 1);
      assert.ok(iterationWarnings[0].value?.includes("10 iterations"));
    });

    it("should NOT warn when iterations are sufficient (>= 100000)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', 'longenoughsalt', 100000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const iterationWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("iterations")
      );
      assert.strictEqual(iterationWarnings.length, 0);
    });

    it("should NOT warn when iterations are above the threshold", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', 'longenoughsalt', 600000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const iterationWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("iterations")
      );
      assert.strictEqual(iterationWarnings.length, 0);
    });
  });

  describe("weak salt", () => {
    it("should detect empty string salt", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', '', 100000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const saltWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("salt")
      );
      assert.strictEqual(saltWarnings.length, 1);
    });

    it("should detect short string salt (less than 8 characters)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', 'abc', 100000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const saltWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("salt")
      );
      assert.strictEqual(saltWarnings.length, 1);
    });

    it("should NOT warn for salt of adequate length", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', 'a_salt_value', 100000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const saltWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("salt")
      );
      assert.strictEqual(saltWarnings.length, 0);
    });

    it("should NOT warn when salt is a variable (not a literal)", () => {
      const code = `
        import crypto from 'crypto';
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2Sync('password', salt, 100000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const saltWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("salt")
      );
      assert.strictEqual(saltWarnings.length, 0);
    });
  });

  describe("combined issues", () => {
    it("should detect both low iterations and weak salt in a single call", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', '', 1000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const cryptoWarnings = warnings.filter((w) => w.kind === "crypto-api-misuse");
      assert.strictEqual(cryptoWarnings.length, 2);

      const saltWarning = cryptoWarnings.find((w) => w.value?.includes("salt"));
      const iterationWarning = cryptoWarnings.find((w) => w.value?.includes("iterations"));
      assert.ok(saltWarning);
      assert.ok(iterationWarning);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when crypto-api-misuse is not enabled", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', '', 1000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser().analyse(code);

      const cryptoWarnings = warnings.filter((w) => w.kind === "crypto-api-misuse");
      assert.strictEqual(cryptoWarnings.length, 0);
    });

    it("should report warnings when optionalWarnings is true (all enabled)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', '', 1000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      const cryptoWarnings = warnings.filter((w) => w.kind === "crypto-api-misuse");
      assert.strictEqual(cryptoWarnings.length, 2);
    });

    it("should report warnings when crypto-api-misuse is in the optional set", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', 'short', 500, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: new Set(["crypto-api-misuse"])
      }).analyse(code);

      const cryptoWarnings = warnings.filter((w) => w.kind === "crypto-api-misuse");
      assert.ok(cryptoWarnings.length > 0);
    });

    it("should NOT report warnings when a different optional warning is enabled", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync('password', '', 1000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["synchronous-io"]
      }).analyse(code);

      const cryptoWarnings = warnings.filter((w) => w.kind === "crypto-api-misuse");
      assert.strictEqual(cryptoWarnings.length, 0);
    });
  });

  describe("non-crypto module", () => {
    it("should NOT warn when crypto module is not imported", () => {
      const code = `
        const crypto = {
          pbkdf2Sync() {}
        }
        crypto.pbkdf2Sync('password', '', 1000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const cryptoWarnings = warnings.filter((w) => w.kind === "crypto-api-misuse");
      assert.strictEqual(cryptoWarnings.length, 0);
    });
  });

  describe("require-style imports", () => {
    it("should detect low iterations with require-style import", () => {
      const code = `
        const crypto = require('crypto');
        crypto.pbkdf2Sync('password', 'longenoughsalt', 50, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const iterationWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("iterations")
      );
      assert.strictEqual(iterationWarnings.length, 1);
    });

    it("should detect weak salt with require-style import", () => {
      const code = `
        const crypto = require('crypto');
        crypto.pbkdf2Sync('password', '', 100000, 64, 'sha512');
      `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: ["crypto-api-misuse"]
      }).analyse(code);

      const saltWarnings = warnings.filter(
        (w) => w.kind === "crypto-api-misuse" && w.value?.includes("salt")
      );
      assert.strictEqual(saltWarnings.length, 1);
    });
  });
});

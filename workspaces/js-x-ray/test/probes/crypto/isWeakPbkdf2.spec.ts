// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../../src/AstAnalyser.ts";

function analyse(code: string) {
  return new AstAnalyser({
    optionalWarnings: ["crypto.weak-pbkdf2"]
  }).analyse(code);
}

describe("isWeakPbkdf2", () => {
  describe("low-iterations", () => {
    it("should warn when iterations are below the OWASP minimum for sha512", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.weak-pbkdf2");
      assert.strictEqual(outputWarnings[0].value, "low-iterations");
    });

    it("should warn when iterations are below the OWASP minimum for sha256", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync(password, salt, 500000, 64, 'sha256');
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.weak-pbkdf2");
      assert.strictEqual(outputWarnings[0].value, "low-iterations");
    });

    it("should resolve the iteration count from a variable", () => {
      const code = `
        import crypto from 'crypto';
        const iterations = 1000;
        crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-iterations");
    });

    it("should warn when iterations are below the lowest floor and the digest is unknown", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, salt, 1000, 64, digest, (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-iterations");
    });

    it("should not warn when iterations meet the OWASP minimum for sha512", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, salt, 210000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when iterations meet the OWASP minimum for sha256", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha256');
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the digest is unknown but iterations are above the lowest floor", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, salt, 300000, 64, digest, (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the iteration count cannot be resolved statically", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, salt, getIterations(), 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("short-salt", () => {
    it("should warn when salt is a short string literal (less than 16 bytes)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, "short", 210000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.weak-pbkdf2");
      assert.strictEqual(outputWarnings[0].value, "short-salt");
    });

    it("should warn when salt is an empty string literal", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2Sync(password, "", 210000, 64, 'sha512');
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "short-salt");
    });
  });

  describe("hardcoded-salt", () => {
    it("should warn when salt is a hardcoded string literal of 16 bytes or more", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, "this-is-a-long-hardcoded-salt", 210000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.weak-pbkdf2");
      assert.strictEqual(outputWarnings[0].value, "hardcoded-salt");
    });
  });

  describe("combined warnings", () => {
    it("should report low-iterations and short-salt in a single warning", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, "abc", 1000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-iterations, short-salt");
    });
  });

  describe("no warning (proper usage)", () => {
    it("should not warn when salt is a variable", () => {
      const code = `
        import crypto from 'crypto';
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(password, salt, 210000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when crypto module is not imported", () => {
      const code = `
        const crypto = { pbkdf2() {} };
        crypto.pbkdf2(password, "short", 1000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when crypto.weak-pbkdf2 is not enabled", () => {
      const code = `
        import crypto from 'crypto';
        crypto.pbkdf2(password, "short", 1000, 64, 'sha512', (err, key) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});

// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

describe("isWeakBcrypt", () => {
  describe("low-work-factor", () => {
    it("should warn when bcrypt.hashSync rounds are below the OWASP minimum (< 10)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const hash = bcrypt.hashSync(password, 4);
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should warn when bcrypt.genSalt rounds are below the OWASP minimum (< 10)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const salt = bcrypt.genSalt(8, (err, salt) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should warn when bcrypt.genSaltSync rounds are below the OWASP minimum (< 10)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const salt = bcrypt.genSaltSync(8);
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should warn when bcryptjs is imported as a namespace (import * as bcrypt)", () => {
      const code = `
        import * as bcrypt from 'bcryptjs';
        bcrypt.hash(password, 4, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should warn when bcryptjs.hash is imported as a named import", () => {
      const code = `
        import { hash } from 'bcryptjs';
        hash(password, 4, (err, h) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should warn when rounds are stored in a constant with a low literal value", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const ROUNDS = 4;
        bcrypt.hash(password, ROUNDS, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should warn when rounds are exactly 9 (one below the OWASP minimum)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        bcrypt.hash(password, 9, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-bcrypt");
      assert.strictEqual(outputWarnings[0].value, "low-work-factor");
    });

    it("should not warn when rounds meet the OWASP minimum (>= 10)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        bcrypt.hash(password, 12, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when rounds are exactly 10 (the OWASP minimum)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        bcrypt.hash(password, 10, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("hardcoded-salt", () => {
    it("should warn when a hardcoded salt string is passed to bcrypt.hash", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        bcrypt.hash(password, "$2b$10$N9qo8uLOickgx2ZMRZoMye", (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "weak-bcrypt");
      assert.strictEqual(outputWarnings[0].value, "hardcoded-salt");
    });

    it("should warn when a hardcoded salt string is passed to bcrypt.hashSync", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const hash = bcrypt.hashSync(password, "$2b$10$N9qo8uLOickgx2ZMRZoMye");
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].value, "hardcoded-salt");
    });
  });

  describe("no warning (proper usage)", () => {
    it("should not warn when rounds are a variable", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        bcrypt.hash(password, rounds, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when salt comes from a generated value", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const salt = bcrypt.genSaltSync(12);
        bcrypt.hash(password, salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when bcryptjs module is not imported", () => {
      const code = `
        const bcrypt = { hash() {} };
        bcrypt.hash(password, 4, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("known limitations", () => {
    it("should not warn for the less used bcrypt package (only bcryptjs is supported)", () => {
      const code = `
        import bcrypt from 'bcrypt';
        bcrypt.hash(password, 4, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["weak-bcrypt"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when weak-bcrypt is not enabled", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        bcrypt.hash(password, 4, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});

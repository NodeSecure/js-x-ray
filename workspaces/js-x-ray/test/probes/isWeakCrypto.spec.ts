// Import Node.js Dependencies
import assert from "node:assert";
import {
  promises as fs,
  readFileSync
} from "node:fs";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

// CONSTANTS
const kFixtureURL = new URL("fixtures/weakCrypto/", import.meta.url);

describe("isWeakCrypto probe", () => {
  describe("crypto.createHash", () => {
    it(`should detect weak algorithm when createHash is destructured from crypto
      (e.g. \`const { createHash } = require('crypto')\`)`, async() => {
      const fixturesDir = new URL("directCallExpression/", kFixtureURL);
      const fixtureFiles = await fs.readdir(fixturesDir);

      for (const fixtureFile of fixtureFiles) {
        const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
        const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);

        const [firstWarning] = outputWarnings;
        assert.strictEqual(outputWarnings.length, 1);
        assert.deepEqual(firstWarning.kind, "weak-crypto");
        assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
      }
    });

    it("should detect weak algorithm when called as a member expression (e.g. `crypto.createHash('md5')`)", async() => {
      const fixturesDir = new URL("memberExpression/", kFixtureURL);
      const fixtureFiles = await fs.readdir(fixturesDir);

      for (const fixtureFile of fixtureFiles) {
        const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
        const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);

        const [firstWarning] = outputWarnings;
        assert.strictEqual(outputWarnings.length, 1);
        assert.deepEqual(firstWarning.kind, "weak-crypto");
        assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
      }
    });

    it("should not warn when using a strong algorithm (e.g. `crypto.createHash('sha256')`)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.createHash('sha256');
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when crypto module is not imported", () => {
      const code = `
        const crypto = {
          createHash() {}
        }
        crypto.createHash('md5');
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("crypto.createHmac", () => {
    it(`should detect weak algorithm when createHmac is destructured from crypto
      (e.g. \`const { createHmac } = require('crypto')\`)`, async() => {
      const fixturesDir = new URL("createHmac/directCallExpression/", kFixtureURL);
      const fixtureFiles = await fs.readdir(fixturesDir);

      for (const fixtureFile of fixtureFiles) {
        const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
        const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);

        const [firstWarning] = outputWarnings;
        assert.strictEqual(outputWarnings.length, 1);
        assert.deepEqual(firstWarning.kind, "weak-crypto");
        assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
      }
    });

    it("should detect weak algorithm when called as a member expression (e.g. `crypto.createHmac('md5')`)", async() => {
      const fixturesDir = new URL("createHmac/memberExpression/", kFixtureURL);
      const fixtureFiles = await fs.readdir(fixturesDir);

      for (const fixtureFile of fixtureFiles) {
        const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
        const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);

        const [firstWarning] = outputWarnings;
        assert.strictEqual(outputWarnings.length, 1);
        assert.deepEqual(firstWarning.kind, "weak-crypto");
        assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
      }
    });

    it("should not warn when using a strong algorithm (e.g. `crypto.createHmac('sha256')`)", () => {
      const code = `
        import crypto from 'crypto';
        crypto.createHmac('sha256', 'secret');
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when crypto module is not imported", () => {
      const code = `
        const crypto = {
          createHmac() {}
        }
        crypto.createHmac('md5');
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});


// Import Node.js Dependencies
import assert from "node:assert";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

const FIXTURE_URL = new URL("fixtures/dataExfiltration/", import.meta.url);

describe("data exfiltration", () => {
  describe("sensitivity: conservative", () => {
    test("it should report a warning in case of `JSON.stringify(sensitiveData) for member expression`", async() => {
      const fixturesDir = new URL("memberExpression/", FIXTURE_URL);
      const fixtureFiles = await fs.readdir(fixturesDir);

      for (const fixtureFile of fixtureFiles) {
        const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
        const { warnings: outputWarnings } = new AstAnalyser(
          {
            optionalWarnings: true
          }
        ).analyse(fixture);

        const [firstWarning] = outputWarnings;
        assert.strictEqual(outputWarnings.length, 1);
        assert.deepEqual(firstWarning.kind, "data-exfiltration");
        assert.strictEqual(firstWarning.value, `${fixtureFile.split(".").slice(0, 2).join(".")}`);
      }
    });

    test("it should report a warning in case of `JSON.stringify(sensitiveData) for direct call expression`", async() => {
      const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
      const fixtureFiles = await fs.readdir(fixturesDir);

      for (const fixtureFile of fixtureFiles) {
        const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
        const { warnings: outputWarnings } = new AstAnalyser(
          {
            optionalWarnings: true
          }
        ).analyse(fixture);

        const [firstWarning] = outputWarnings;
        assert.strictEqual(outputWarnings.length, 1);
        assert.deepEqual(firstWarning.kind, "data-exfiltration");
        assert.strictEqual(firstWarning.value, `${fixtureFile.split(".").slice(0, 2).join(".")}`);
      }
    });

    test("should only generate one warning when multiple detection of data exfiltration occurs", () => {
      const code = `
     import os from "os";

     JSON.stringify(os.userInfo());
     JSON.stringify(os.userInfo());
     JSON.stringify(os.networkInterfaces());
    `;

      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true
        }
      ).analyse(code);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, "os.userInfo, os.networkInterfaces");
      assert.strictEqual(firstWarning.location?.length, 3);
    });

    test("should not generate a warning when serializing return value of every function call", () => {
      const code = `
     function foo (){
        return "foo";
     }
     JSON.stringify(foo());
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true
        }
      ).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    test("should not generate a warning when os is not imported", () => {
      const code = `
     const os = {
        userInfo(){
            return {};
        },
        cpus(){
            return [];
        },
        networkInterfaces(){
            return [];
        }

     }
     JSON.stringify(os.userInfo());
     JSON.stringify(os.networkInterfaces());
     JSON.stringify(os.cpus());
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true
        }
      ).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    test("should not generate a warning when dns is not imported", () => {
      const code = `
     const dns = {
        getServers(){
            return [];
        }
     }
     JSON.stringify(getServers());
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true
        }
      ).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("sensitivity: aggressive", () => {
    test("should generate a warning as soon as a os import is detected", () => {
      const code = `
     import os from "node:os";
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true,
          sensitivity: "aggressive"
        }
      ).analyse(code);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, "os");
    });

    test("should generate a warning as soon as a dns import is detected", () => {
      const code = `
     import dns from "node:dns";
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true,
          sensitivity: "aggressive"
        }
      ).analyse(code);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, "dns");
    });

    test("should not generate a warning when the import is not from the expected modules module", () => {
      const code = `
     import * as c from "crypto";
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true,
          sensitivity: "aggressive"
        }
      ).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    test("should not detect the conservative warning", () => {
      const code = `
     import dns from "node:dns";


     JSON.stringify(dns.getServers());
    `;
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true,
          sensitivity: "aggressive"
        }
      ).analyse(code);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, "dns");
    });

    test("should generate only one warning when multiple detection occurs", () => {
      const code = `
     import dns from "node:dns";
     import os from "node:os";
    `;

      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true,
          sensitivity: "aggressive"
        }
      ).analyse(code);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, "dns, os");
      assert.strictEqual(firstWarning.location?.length, 2);
    });
  });
});

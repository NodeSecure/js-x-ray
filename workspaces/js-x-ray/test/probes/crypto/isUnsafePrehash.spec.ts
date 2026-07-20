// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../../src/AstAnalyser.ts";

describe("isUnsafePrehash probe", () => {
  describe("crypto.unsafe-prehash", () => {
    it("should warn when a raw digest() (no encoding) is passed to bcryptjs.hash", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when a raw digest() (no encoding) is passed to bcryptjs.hashSync", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const hash = bcrypt.hashSync(crypto.createHash('sha256').update(password).digest(), salt);
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when digest() uses an unsafe encoding (binary/latin1)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest('binary'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn for createHmac digest chains too", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHmac('sha384', pepper).update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when digest().toString() (no encoding) is used", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest().toString(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when digest().toString('binary') is used", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest().toString('binary'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when digest('binary').toString('hex') is used (outer toString is a no-op)", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest('binary').toString('hex'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when bcryptjs is imported as a namespace", () => {
      const code = `
        import * as bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when bcryptjs.hash is imported as a named import", () => {
      const code = `
        import { hash } from 'bcryptjs';
        import crypto from 'crypto';
        hash(crypto.createHash('sha256').update(password).digest(), salt, (err, h) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });
    it("should warn when digest is reassigned, then called as hash argument", () => {
      const code = `
        import * as bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const digest = crypto.createHash('sha256').update(password).digest;
        bcrypt.hash(digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });
  });

  describe("variable indirection", () => {
    it("should warn when an unsafely pre-hashed variable is passed to bcryptjs.hash", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const prehashed = crypto.createHash('sha256').update(password).digest();
        bcrypt.hash(prehashed, salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should warn when an unsafely pre-hashed variable (via toString) is passed to bcryptjs.hashSync", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const prehashed = crypto.createHash('sha256').update(password).digest().toString('binary');
        const hash = bcrypt.hashSync(prehashed, salt);
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });

    it("should not warn when a safely pre-hashed variable is passed to bcryptjs.hash", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const prehashed = crypto.createHash('sha256').update(password).digest('base64');
        bcrypt.hash(prehashed, salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the bcryptjs argument variable is unrelated to any digest", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const plainValue = getUserInput();
        bcrypt.hash(plainValue, salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when an unrelated function parameter shares its name with an unsafe pre-hashed variable", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';

        function bar(prehashed) {
          bcrypt.hash(prehashed, salt, (err, hash) => {});
        }
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when an unrelated arrow function parameter shares its name with an unsafe pre-hashed variable", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';

        const bar = (prehashed) => {
          bcrypt.hash(prehashed, salt, (err, hash) => {});
        };
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when an unrelated destructured parameter shares its name with an unsafe pre-hashed variable", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';

        function foo() {
          const prehashed = crypto.createHash('sha256').update(password).digest();
        }

        function bar({ prehashed }) {
          bcrypt.hash(prehashed, salt, (err, hash) => {});
        }
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when an unrelated local variable shares its name with an unsafe pre-hashed variable", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';

        function bar() {
          const prehashed = someUnrelatedSafeValue();
          bcrypt.hash(prehashed, salt, (err, hash) => {});
        }
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should still warn for the unsafe declarator itself when its name later collides with an unrelated variable", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';

        function foo() {
          const prehashed = crypto.createHash('sha256').update(password).digest();
          bcrypt.hash(prehashed, salt, (err, hash) => {});
        }

        function bar() {
          const prehashed = someUnrelatedSafeValue();
        }
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.strictEqual(outputWarnings[0].kind, "crypto.unsafe-prehash");
    });
  });

  describe("no warning (proper usage)", () => {
    it("should not warn when digest() uses base64 encoding", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest('base64'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when digest() uses hex encoding", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest('hex'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when the encoding is stored in an identifier pointing to a safe literal", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const encoding = 'hex';
        const prehashed = crypto.createHash('sha256').update(password).digest(encoding);
        bcrypt.hash(prehashed, salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when digest().toString('hex') is used", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest().toString('hex'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when digest('hex').toString('binary') is used", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest('hex').toString('binary'), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn for a plain bcryptjs.hash call without pre-hashing", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(password, salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when crypto module is not imported", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        const crypto = { createHash() { return { update() { return this; }, digest() {} }; } };
        bcrypt.hash(crypto.createHash('sha256').update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when bcryptjs module is not imported", () => {
      const code = `
        import crypto from 'crypto';
        const bcrypt = { hash() {} };
        bcrypt.hash(crypto.createHash('sha256').update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("known limitations", () => {
    it("should not warn for the real bcrypt package (only bcryptjs is supported)", () => {
      const code = `
        import bcrypt from 'bcrypt';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn for a renamed bcryptjs named import (known VariableTracer limitation)", () => {
      const code = `
        import { hash as bcryptHash } from 'bcryptjs';
        import crypto from 'crypto';
        bcryptHash(crypto.createHash('sha256').update(password).digest(), salt, (err, h) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    it("should not warn when an unsafely pre-hashed digest reaches bcrypt through a function parameter", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';

        function hashPassword(prehashed) {
          bcrypt.hash(prehashed, salt, callback);
        }
        hashPassword(crypto.createHash('sha256').update(password).digest());
      `;
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: ["crypto.unsafe-prehash"]
      }).analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  describe("optional warning behavior", () => {
    it("should NOT report warnings when crypto.unsafe-prehash is not enabled", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest(), salt, (err, hash) => {});
      `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });
});

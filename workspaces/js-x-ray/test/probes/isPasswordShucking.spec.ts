// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

const kOptions = { optionalWarnings: ["password-shucking"] as const };

describe("isPasswordShucking probe", () => {
  it("should warn regardless of encoding, shuckability is independent of digest encoding", () => {
    for (const encoding of ["", "'hex'", "'base64'", "'base64url'", "'binary'"]) {
      const arg = encoding ? `digest(${encoding})` : "digest()";
      const code = `
          import bcrypt from 'bcryptjs';
          import crypto from 'crypto';
          bcrypt.hash(crypto.createHash('sha256').update(password).${arg}, salt, (err, hash) => {});
        `;
      const { warnings } = new AstAnalyser(kOptions).analyse(code);

      assert.strictEqual(warnings.length, 1, `Expected warning for encoding: ${encoding || "none"}`);
      assert.strictEqual(warnings[0].kind, "password-shucking");
    }
  });

  it("should warn when a createHash digest with a safe encoding is stored in a variable (unique to this probe)", () => {
    const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        const prehashed = crypto.createHash('sha512').update(password).digest('hex');
        bcrypt.hash(prehashed, salt, (err, hash) => {});
      `;
    const { warnings } = new AstAnalyser(kOptions).analyse(code);

    assert.strictEqual(warnings.length, 1);
    assert.strictEqual(warnings[0].kind, "password-shucking");
  });

  it("should not warn when createHmac is used, pepper prevents hash enumeration", () => {
    const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHmac('sha512', pepper).update(password).digest('base64'), salt, (err, hash) => {});
      `;
    const { warnings } = new AstAnalyser(kOptions).analyse(code);

    assert.strictEqual(warnings.length, 0);
  });

  describe("optional warning behavior", () => {
    it("should not report when password-shucking is not enabled", () => {
      const code = `
        import bcrypt from 'bcryptjs';
        import crypto from 'crypto';
        bcrypt.hash(crypto.createHash('sha256').update(password).digest('hex'), salt, (err, hash) => {});
      `;
      const { warnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(warnings.length, 0);
    });
  });
});

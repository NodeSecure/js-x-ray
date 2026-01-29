/* eslint-disable no-template-curly-in-string */
// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

describe("sql-injection", () => {
  test("should detect sql injection on select queries", () => {
    const queries = [
      "`SELECT * FROM users WHERE email = ${email}`",
      "`INSERT INTO users VALUES('admin', ${password})`",
      "`UPDATE users SET email = ${email} WHERE id = 1`",
      "`DELETE FROM users WHERE id = ${id}`",
      "`1' UNION SELECT * FROM users where email = ${email}`"
    ];
    queries.forEach((query) => {
      const code = `
    await client.query(${query});
  `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(outputWarnings[0].kind, "sql-injection");
      assert.strictEqual(outputWarnings[0].value, query.replace(/\$\{[^}]*\}/, "${0}").replace(/`/g, ""));
    });
  });

  test("should detect sql injection assigned in a variable", () => {
    const query = "`SELECT * FROM users WHERE id = ${userId}`";
    const code = `const userId = req.query.id;
                  const query = ${query};
                  db.query(query);`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);
    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "sql-injection");
    assert.strictEqual(outputWarnings[0].value, query.replace(/\$\{[^}]*\}/, "${0}").replace(/`/g, ""));
  });

  test("should not detect sql injection when the query is not a TemplateLiteral in variable", () => {
    const code = `const query = "SELECT * FROM users WHERE id = 1";
                  db.query(query);`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);
    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect sql injection when the variable is not an sql query", () => {
    const code = `const query = \`hello \${name}\`;
                  db.query(query);`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);
    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should be case insensitive", () => {
    const queries = [
      "`SeLEcT * FRoM users wHERe eMail = ${email}`",
      "`INsERT InTO uSers VaLUeS('aDmin', ${password})`",
      "`UPDAtE users sET eMail = ${email} WHERE id = 1`",
      "`DElETE FROM users wHERE id = ${id}`"
    ];
    queries.forEach((query) => {
      const code = `
    await client.query(${query});
  `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(outputWarnings[0].kind, "sql-injection");
      assert.strictEqual(outputWarnings[0].value, query.replace(/\$\{[^}]*\}/, "${0}").replace(/`/g, ""));
    });
  });

  test("should not detect an sql injection when the template literal is not an sql query", () => {
    const sentences = [
      "`Please select a product in this ${menu} menu`",
      "`Update your preferences ${here}`",
      "`The report is from last ${week}`",
      "`insert that ${here}`",
      "`I want to delete this item ${item}`"
    ];

    sentences.forEach((sentence) => {
      const code = `
    await client.query(${sentence});
    `;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });
  });

  test("should detect non trimed query", () => {
    const code = `
    await client.query(\` SELECT * FROM users WHERE email = \${email} \`);
  `;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "sql-injection");
    assert.strictEqual(outputWarnings[0].value, ` SELECT * FROM users WHERE email = \${${0}} `);
  });

  test("should not detect any warning when the sql query is not passed in a function call", () => {
    const code = `
    const query = \`SELECT * FROM users WHERE email = \${ email } \`;
  `;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should only detect sql injection when the string is a template literal", () => {
    const code = `
    await client.query("SELECT * FROM users WHERE email = $1");
  `;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should detect the sql injection in a call with multiple parametter", () => {
    const code = `
    await client.query([userId],\`SELECT * FROM users
 WHERE userId = $1 and email = \${email}\`);
  `;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "sql-injection");
    assert.strictEqual(outputWarnings[0].value, `SELECT * FROM users\n WHERE userId = $1 and email = \${${0}}`);
  });

  test(`should detect the sql injection in a
 call with multiple template literals`, () => {
    const code = `
    await client.query(\`user-\${id}\`,\`SELECT * FROM users
 WHERE userId = $1 and email = \${email}\`);
  `;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "sql-injection");
    assert.strictEqual(outputWarnings[0].value, `SELECT * FROM users\n WHERE userId = $1 and email = \${${0}}`);
  });

  test("should not detect the warning if the template literal does not have any template element", () => {
    const code = `
    await client.query(\` SELECT * FROM users WHERE email = 'exemple@hotmail.fr' \`);
  `;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });
});


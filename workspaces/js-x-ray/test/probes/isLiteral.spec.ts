// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import isLiteral from "../../src/probes/isLiteral.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";
import { CollectableSet } from "../../src/CollectableSet.ts";

test("should throw an unsafe-import because the hexadecimal string is equal to the core 'http' dependency", (t) => {
  const str = "const foo = '68747470'";
  const ast = parseScript(str);

  const sastAnalysis = getSastAnalysis(isLiteral);
  const analyzeStringMock = t.mock.method(sastAnalysis.sourceFile.deobfuscator, "analyzeString");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning?.kind, "unsafe-import");

  assert.ok(sastAnalysis.dependencies().has("http"));
  const calls = analyzeStringMock.mock.calls;
  assert.strictEqual(calls.length, 1);
  assert.ok(calls[0].arguments.includes("http"));
});

test("should throw an encoded-literal warning because the hexadecimal value is equal to 'require'", (t) => {
  const str = "const _t = globalThis['72657175697265']";
  const ast = parseScript(str);

  const sastAnalysis = getSastAnalysis(isLiteral);
  const analyzeStringMock = t.mock.method(sastAnalysis.sourceFile.deobfuscator, "analyzeString");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  assert.strictEqual(warning?.value, "72657175697265");

  const calls = analyzeStringMock.mock.calls;
  assert.strictEqual(calls.length, 1);
  assert.ok(calls[0].arguments.includes("require"));
});

test("should not throw an encoded-literal warning because hexadecimal value is safe", () => {
  const str = "const foo = '123456789'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should throw an encoded-literal warning because hexadecimal value is not safe", () => {
  // Note: hexadecimal equal 'hello world'
  const str = "const foo = '68656c6c6f20776f726c64'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  assert.strictEqual(warning?.value, "68656c6c6f20776f726c64");
});

test("should not throw any warnings without hexadecimal value (and should call analyzeLiteral of Analysis class)", (t) => {
  const str = "const foo = 'hello world!'";
  const ast = parseScript(str);

  const sastAnalysis = getSastAnalysis(isLiteral);
  const analyzeLiteralMock = t.mock.method(sastAnalysis.sourceFile, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const calls = analyzeLiteralMock.mock.calls;
  assert.strictEqual(calls.length, 1);

  const astNode = calls[0].arguments[0];
  assert.strictEqual(astNode.value, "hello world!");
});

describe("known suspicious domain", () => {
  const suspiciousDomains = [
    "bit.ly/foo",
    "ipinfo.io/json",
    "httpbin.org/ip",
    "api.ipify.org/ip"
  ];

  test("should detect shady link when an URL is known to be suspicious when protocol is http", () => {
    for (const suspicousDomain of suspiciousDomains) {
      const str = `const foo = 'http://${suspicousDomain}'`;
      const ast = parseScript(str);
      const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);
      assert.strictEqual(sastAnalysis.warnings().length, 1);
      const warning = sastAnalysis.getWarning("shady-link");
      assert.strictEqual(warning?.value, `http://${suspicousDomain}`);
    }
  });

  test("should detect shady link when an URL is known to be suspicious when protocol is https", () => {
    for (const suspicousDomain of suspiciousDomains) {
      const str = `const foo = 'https://${suspicousDomain}'`;
      const ast = parseScript(str);
      const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);
      assert.strictEqual(sastAnalysis.warnings().length, 1);
      const warning = sastAnalysis.getWarning("shady-link");
      assert.strictEqual(warning?.value, `https://${suspicousDomain}`);
    }
  });
});

test("should detect shady link when an URL has a suspicious domain", () => {
  const str = "const foo = 'http://foobar.link'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.value, "http://foobar.link");
});

test("should mark suspicious links the IPv4 address range 127.0.0.0/8 (localhost 127.0.0.1)", () => {
  const str = "const IPv4URL = ['http://127.0.0.1/script', 'http://127.7.7.7/script']";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 2);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.kind, "shady-link");
  assert.strictEqual(warning?.severity, "Information");
});

test("should be considered suspicious a link with a raw IPv4 address 127.0.0.1 and a port", () => {
  const str = "const IPv4URL = 'http://127.0.0.1:80/script'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.kind, "shady-link");
  assert.strictEqual(warning?.severity, "Information");
});

test("should detect the link as suspicious when a URL contains a raw IPv4 address", () => {
  const str = "const IPv4URL = 'http://77.244.210.247/burpcollaborator.txt'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.value, "http://77.244.210.247/burpcollaborator.txt");
});

test("should detect suspicious links when a URL contains a raw IPv4 address with port", () => {
  const str = "const IPv4URL = 'http://77.244.210.247:8080/script'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.value, "http://77.244.210.247:8080/script");
});

test("should detect suspicious links when a URL contains a raw IPv6 address", () => {
  const str = "const IPv6URL = 'http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/index.html'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.value, "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/index.html");
});

test("should detect suspicious links when a URL contains a raw IPv6 address with port", () => {
  const str = "const IPv6URL = 'http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:100/script'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.value, "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:100/script");
});

test("should collect public ip address", () => {
  const str = "const IPV6 = '8.8.8.8';";
  const ipSet = new CollectableSet("ip");
  const collectables = [ipSet];
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral, {
    location: "file.js",
    collectables,
    metadata: { spec: "react@19.0.1" }
  }).execute(ast.body);

  assert.strictEqual(sastAnalysis.getWarning("shady-link"), undefined);
  assert.deepEqual(Array.from(ipSet), [{
    value: "8.8.8.8",
    locations: [{ file: "file.js", location: [[[1, 13], [1, 22]]], metadata: { spec: "react@19.0.1" } }]
  }]);
});

test("should collect and detect private address with an Information severity", () => {
  const str = "const IPV6 = '127.0.0.1';";
  const ipSet = new CollectableSet("ip");
  const collectables = [ipSet];
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteral, { location: "file.js", collectables, metadata: { spec: "react@19.0.1" } })
    .execute(ast.body);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning?.value, "127.0.0.1");
  assert.strictEqual(warning?.severity, "Information");
  assert.deepEqual(warning?.location, [[1, 13], [1, 24]]);

  assert.deepEqual(Array.from(ipSet), [{
    value: "127.0.0.1",
    locations: [{ file: "file.js", location: [[[1, 13], [1, 24]]], metadata: { spec: "react@19.0.1" } }]
  }]);
});

test("should collect the full url and the ip address", () => {
  const urlSet = new CollectableSet("url");
  const ipSet = new CollectableSet("ip");
  const hostnameSet = new CollectableSet("hostname");
  const collectables = [urlSet, ipSet, hostnameSet];
  const str = "const IPv4URL = 'http://127.0.0.1:80/script'";
  const ast = parseScript(str);
  getSastAnalysis(isLiteral, { location: "file.js", collectables, metadata: { spec: "react@19.0.1" } }).execute(ast.body);
  assert.deepEqual(Array.from(urlSet), [{
    value: "http://127.0.0.1/script",
    locations: [{ file: "file.js", location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
  }]);
  assert.deepEqual(Array.from(hostnameSet), []);
  assert.deepEqual(Array.from(ipSet), [{
    value: "127.0.0.1",
    locations: [{ file: "file.js", location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
  }]);
});

test("should not collect a hostname when there is none", () => {
  const str = "const protocol = 'blob://'";

  const hostnameSet = new CollectableSet("hostname");

  const collectables = [hostnameSet];
  const ast = parseScript(str);
  getSastAnalysis(isLiteral, { location: "file.js", collectables }).execute(ast.body);
  assert.deepEqual(Array.from(hostnameSet), []);
});

test("should not detect file:// link ", () => {
  const str = `worker = realRequire(decodeURIComponent(filename.replace(process.platform === 'win32' ?
      'file:///server' : 'file://server/share/file.txt', '')));`;

  const urlSet = new CollectableSet("url");
  const ipSet = new CollectableSet("ip");
  const hostnameSet = new CollectableSet("hostname");
  const collectables = [urlSet, ipSet, hostnameSet];

  const ast = parseScript(str);
  const sastAnalysis =
    getSastAnalysis(isLiteral, { location: "file.js", collectables, metadata: { spec: "react@19.0.1" } }).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  assert.deepEqual(Array.from(urlSet), [{
    value: "file:///server",
    locations: [{ file: "file.js", location: [[[2, 6], [2, 22]]], metadata: { spec: "react@19.0.1" } }]
  }, {
    value: "file://server/share/file.txt",
    locations: [{ file: "file.js", location: [[[2, 25], [2, 55]]], metadata: { spec: "react@19.0.1" } }]
  }]);
  assert.deepEqual(Array.from(hostnameSet), [{
    value: "server",
    locations: [
      {
        file: "file.js", location: [[[2, 25], [2, 55]]], metadata: { spec: "react@19.0.1" }
      }
    ]
  }]);
  assert.deepEqual(Array.from(ipSet), []);
});

describe("email collection", () => {
  test("should collect valid email addresses", () => {
    const str = `
      const email1 = "user@example.com";
      const email2 = "name.surname@domain.co.uk";
      const email3 = "test123@test-domain.org";
    `;
    const ast = parseScript(str);
    const emailSet = new CollectableSet("email");
    const sastAnalysis = getSastAnalysis(isLiteral, { collectables: [emailSet] })
      .execute(ast.body);

    assert.strictEqual(sastAnalysis.warnings().length, 0);

    const emails = Array.from(emailSet);
    assert.strictEqual(emails.length, 3);
    assert.ok(emails.some((e) => e.value === "user@example.com"));
    assert.ok(emails.some((e) => e.value === "name.surname@domain.co.uk"));
    assert.ok(emails.some((e) => e.value === "test123@test-domain.org"));
  });

  test("should not collect invalid email formats", () => {
    const str = `
      const invalid1 = "@example.com";
      const invalid2 = "user@";
      const invalid3 = "user@@example.com";
      const invalid4 = ".user@example.com";
      const invalid5 = "user.@example.com";
    `;
    const ast = parseScript(str);
    const emailSet = new CollectableSet("email");
    getSastAnalysis(isLiteral, { collectables: [emailSet] })
      .execute(ast.body);

    const emails = Array.from(emailSet);
    assert.strictEqual(emails.length, 0);
  });

  test("should collect emails from various code contexts", () => {
    const str = `
      const emails = ["admin@site.com", "support@help.io"];
      const config = {
        contact: "info@company.net"
      };
    `;
    const ast = parseScript(str);
    const emailSet = new CollectableSet("email");
    getSastAnalysis(isLiteral, { collectables: [emailSet] })
      .execute(ast.body);

    const emails = Array.from(emailSet);
    assert.strictEqual(emails.length, 3);
    assert.ok(emails.some((e) => e.value === "admin@site.com"));
    assert.ok(emails.some((e) => e.value === "support@help.io"));
    assert.ok(emails.some((e) => e.value === "info@company.net"));
  });

  test("should track email locations correctly", () => {
    const str = `const email = "test@example.com";`;
    const ast = parseScript(str);
    const emailSet = new CollectableSet("email");
    getSastAnalysis(isLiteral, { collectables: [emailSet], location: "test.js" })
      .execute(ast.body);

    const emails = Array.from(emailSet);
    assert.strictEqual(emails.length, 1);
    assert.strictEqual(emails[0].value, "test@example.com");
    assert.ok(emails[0].locations.length > 0);
    assert.ok(emails[0].locations[0].location);
    const locationInfo = emails[0].locations[0];
    assert.strictEqual(locationInfo.file, "test.js");
    assert.strictEqual(locationInfo.metadata, undefined);
    assert.deepStrictEqual(locationInfo.location, [[[1, 14], [1, 32]]]);
  });
});

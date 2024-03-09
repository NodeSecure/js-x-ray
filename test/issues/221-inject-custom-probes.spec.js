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
const kIncriminedCodeSample = "const danger = 'danger';";
const kWarningUnsafeDanger = "unsafe-danger";

test("should detect a custom probe alert unsafe-danger", () => {
  const customProbes = [
    {
      name: "customProbeUnsafeDanger",
      validateNode: (node, sourceFile) => [true]
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

  const analyser = new AstAnalyser(new JsSourceParser(), customProbes);
  const result = analyser.analyse(kIncriminedCodeSample);

  assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
});

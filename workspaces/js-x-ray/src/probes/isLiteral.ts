// Import Node.js Dependencies
import { builtinModules } from "node:module";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { generateWarning } from "../warnings.js";
import type { Literal } from "../types/estree.js";

const kMapRegexIps = Object.freeze({
  // eslint-disable-next-line @stylistic/max-len
  regexIPv4: /^(https?:\/\/)(?!127\.)(?!.*:(?:0{1,3}|25[6-9])\.)(?!.*:(?:25[6-9])\.(?:0{1,3}|25[6-9])\.)(?!.*:(?:25[6-9])\.(?:25[6-9])\.(?:0{1,3}|25[6-9])\.)(?!.*:(?:25[6-9])\.(?:25[6-9])\.(?:25[6-9])\.(?:0{1,3}|25[6-9]))((?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])(?::\d{1,5})?(\/[^\s]*)?$/,
  regexIPv6: /^(https?:\/\/)(\[[0-9A-Fa-f:]+\])(?::\d{1,5})?(\/[^\s]*)?$/
});

// CONSTANTS
const kNodeDeps = new Set(builtinModules);
const kShadyLinkRegExps = [
  kMapRegexIps.regexIPv4,
  kMapRegexIps.regexIPv6,
  /(http[s]?:\/\/(bit\.ly|ipinfo\.io|httpbin\.org|api\.ipify\.org).*)$/,
  /(http[s]?:\/\/.*\.(link|xyz|tk|ml|ga|cf|gq|pw|top|club|mw|bd|ke|am|sbs|date|quest|cd|bid|cd|ws|icu|cam|uno|email|stream))$/
];

/**
 * @description Search for Literal AST Node
 * @see https://github.com/estree/estree/blob/master/es5.md#literal
 * @example
 * "foobar"
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  return [
    node.type === "Literal" && typeof node.value === "string"
  ];
}

function main(
  node: Literal<string>,
  options: { sourceFile: SourceFile; }
) {
  const { sourceFile } = options;
  const location = node.loc ?? void 0;

  // We are searching for value obfuscated as hex of a minimum length of 4.
  if (/^[0-9A-Fa-f]{4,}$/g.test(node.value)) {
    const value = Buffer.from(node.value, "hex").toString();
    sourceFile.deobfuscator.analyzeString(value);

    // If the value we are retrieving is the name of a Node.js dependency,
    // then we add it to the dependencies list and we throw an unsafe-import at the current location.
    if (kNodeDeps.has(value)) {
      sourceFile.addDependency(value, node.loc);
      sourceFile.warnings.push(
        generateWarning(
          "unsafe-import", { value: null, location }
        )
      );
    }
    else if (value === "require" || !Hex.isSafe(node.value)) {
      sourceFile.addEncodedLiteral(node.value, location);
    }
  }
  // Else we are checking all other string with our suspect method
  else {
    for (const regex of kShadyLinkRegExps) {
      if (regex.test(node.value)) {
        sourceFile.warnings.push(
          generateWarning(
            "shady-link", { value: node.value, location }
          )
        );

        return;
      }
    }

    sourceFile.analyzeLiteral(node);
  }
}

export default {
  name: "isLiteral",
  validateNode,
  main,
  breakOnMatch: false
};

// Import Node.js Dependencies
import { builtinModules } from "node:module";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { ShadyLink } from "../ShadyLink.ts";
import { SourceFile } from "../SourceFile.ts";
import type { Literal } from "../estree/types.ts";
import {
  toArrayLocation,
  Hex
} from "../utils/index.ts";
import { generateWarning } from "../warnings.ts";
import type { CollectableSetRegistry } from "../CollectableSetRegistry.ts";

// CONSTANTS
const kNodeDeps = new Set(builtinModules);
const kEmailRegex = /^[^.\s@:](?:[^\s@:]*[^\s@:.])?@[^.\s@]+(?:\.[^.\s@]+)*$/;
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
  options: {
    sourceFile: SourceFile;
    collectableSetRegistry: CollectableSetRegistry;
  }
) {
  const { sourceFile, collectableSetRegistry } = options;
  const location = node.loc ?? void 0;

  const shadyLinkOptions = {
    file: sourceFile.path.location,
    collectableSetRegistry,
    location,
    metadata: sourceFile.metadata
  };

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
  else if (collectableSetRegistry.has("email") && kEmailRegex.test(node.value)) {
    collectableSetRegistry.add("email", {
      value: node.value,
      file: sourceFile.path.location,
      location: toArrayLocation(location),
      metadata: sourceFile.metadata
    });

    return;
  }
  else if (ShadyLink.isValidIPAddress(node.value)) {
    const result = ShadyLink.isIpAddressSafe(node.value, shadyLinkOptions);
    if (!result.safe) {
      sourceFile.warnings.push(
        generateWarning("shady-link", {
          value: node.value,
          location,
          severity: "Information"
        })
      );

      return;
    }
  }
  // Else we are checking all other string with our suspect method
  else {
    const result = ShadyLink.isURLSafe(node.value, shadyLinkOptions);

    if (!result.safe) {
      sourceFile.warnings.push(
        generateWarning("shady-link", {
          value: node.value,
          location,
          severity: result.isLocalAddress ? "Information" : "Warning"
        })
      );

      return;
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

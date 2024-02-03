// Import Third-party Dependencies
import { Patterns } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import * as jjencode from "./jjencode.js";
import * as jsfuck from "./jsfuck.js";
import * as freejsobfuscator from "./freejsobfuscator.js";
import * as obfuscatorio from "./obfuscator-io.js";
import * as trojan from "./trojan-source.js";

// CONSTANTS
const kMinimumIdsCount = 5;

export function isObfuscatedCode(sourceFile, identifiersLength) {
  let encoderName = null;

  if (jsfuck.verify(sourceFile)) {
    encoderName = "jsfuck";
  }
  else if (jjencode.verify(sourceFile)) {
    encoderName = "jjencode";
  }
  else if (sourceFile.morseLiterals.size >= 36) {
    encoderName = "morse";
  }
  else {
    // TODO: also implement Dictionnary checkup
    const identifiers = sourceFile.identifiersName
      .map((value) => value?.name ?? null)
      .filter((name) => typeof name === "string");

    const { prefix, oneTimeOccurence } = Patterns.commonHexadecimalPrefix(
      identifiers
    );
    const uPrefixNames = new Set(Object.keys(prefix));

    if (identifiersLength > kMinimumIdsCount && uPrefixNames.size > 0) {
      sourceFile.hasPrefixedIdentifiers = calcAvgPrefixedIdentifiers(
        sourceFile,
        identifiersLength,
        prefix
      ) > 80;
    }

    if (uPrefixNames.size === 1 && freejsobfuscator.verify(sourceFile, prefix)) {
      encoderName = "freejsobfuscator";
    }
    else if (obfuscatorio.verify(sourceFile)) {
      encoderName = "obfuscator.io";
    }
    // else if ((identifiersLength > (kMinimumIdsCount * 3) && sourceFile.hasPrefixedIdentifiers)
    //     && (oneTimeOccurence <= 3 || sourceFile.counter.encodedArrayValue > 0)) {
    //     encoderName = "unknown";
    // }
  }

  return [encoderName !== null, encoderName];
}

export function hasTrojanSource(sourceString) {
  return trojan.verify(sourceString);
}

function calcAvgPrefixedIdentifiers(
  sourceFile,
  identifiersLength,
  prefix
) {
  const valuesArr = Object.values(prefix).slice().sort((left, right) => left - right);
  if (valuesArr.length === 0) {
    return 0;
  }
  const nbOfPrefixedIds = valuesArr.length === 1 ? valuesArr.pop() : (valuesArr.pop() + valuesArr.pop());
  const maxIds = identifiersLength - sourceFile.idtypes.property;

  return ((nbOfPrefixedIds / maxIds) * 100);
}

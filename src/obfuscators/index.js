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

export function isObfuscatedCode(analysis) {
  let encoderName = null;

  if (jsfuck.verify(analysis)) {
    encoderName = "jsfuck";
  }
  else if (jjencode.verify(analysis)) {
    encoderName = "jjencode";
  }
  else if (analysis.counter.morseLiteral >= 36) {
    encoderName = "morse";
  }
  else {
    // TODO: also implement Dictionnary checkup
    const identifiers = analysis.identifiersName
      .map((value) => value)
      .filter((value) => typeof value === "string");

    const { prefix, oneTimeOccurence } = Patterns.commonHexadecimalPrefix(
      identifiers
    );
    const uPrefixNames = new Set(Object.keys(prefix));

    if (analysis.counter.identifiers > kMinimumIdsCount && uPrefixNames.size > 0) {
      analysis.hasPrefixedIdentifiers = calcAvgPrefixedIdentifiers(analysis, prefix) > 80;
    }
    // console.log(prefix);
    // console.log(oneTimeOccurence);
    // console.log(analysis.hasPrefixedIdentifiers);
    // console.log(analysis.counter.identifiers);
    // console.log(analysis.counter.encodedArrayValue);

    if (uPrefixNames.size === 1 && freejsobfuscator.verify(analysis, prefix)) {
      encoderName = "freejsobfuscator";
    }
    else if (obfuscatorio.verify(analysis)) {
      encoderName = "obfuscator.io";
    }
    // else if ((analysis.counter.identifiers > (kMinimumIdsCount * 3) && analysis.hasPrefixedIdentifiers)
    //     && (oneTimeOccurence <= 3 || analysis.counter.encodedArrayValue > 0)) {
    //     encoderName = "unknown";
    // }
  }

  return [encoderName !== null, encoderName];
}

export function hasTrojanSource(sourceString) {
  return trojan.verify(sourceString);
}

function calcAvgPrefixedIdentifiers(analysis, prefix) {
  const valuesArr = Object.values(prefix).slice().sort((left, right) => left - right);
  if (valuesArr.length === 0) {
    return 0;
  }
  const nbOfPrefixedIds = valuesArr.length === 1 ? valuesArr.pop() : (valuesArr.pop() + valuesArr.pop());
  const maxIds = analysis.counter.identifiers - analysis.idtypes.property;

  return ((nbOfPrefixedIds / maxIds) * 100);
}

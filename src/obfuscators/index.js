"use strict";

// Require Third-party Dependencies
const { Patterns } = require("sec-literal");

// Require Internal Dependencies
const jjencode = require("./jjencode");
const jsfuck = require("./jsfuck");
const freejsobfuscator = require("./freejsobfuscator");
const obfuscatorio = require("./obfuscator-io");

// CONSTANTS
const kMinimumIdsCount = 5;

function isObfuscatedCode(analysis) {
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
        const { prefix, oneTimeOccurence } = Patterns.commonHexadecimalPrefix(
            analysis.identifiersName.map((value) => value.name)
        );
        const uPrefixNames = new Set(Object.keys(prefix));

        if (analysis.counter.identifiers > kMinimumIdsCount && uPrefixNames.size > 0) {
            analysis.hasPrefixedIdentifiers = calcAvgPrefixedIdentifiers(analysis, prefix) > 80;
        }
        // console.log(prefix);
        // console.log(oneTimeOccurence);
        // console.log(this.hasPrefixedIdentifiers);
        // console.log(this.counter.identifiers);
        // console.log(this.counter.encodedArrayValue);

        if (uPrefixNames.size === 1 && freejsobfuscator.verify(analysis, prefix)) {
            encoderName = "freejsobfuscator";
        }
        else if (obfuscatorio.verify(analysis)) {
            encoderName = "obfuscator.io";
        }
        else if ((analysis.counter.identifiers > (kMinimumIdsCount * 3) && analysis.hasPrefixedIdentifiers)
            && (oneTimeOccurence <= 3 || analysis.counter.encodedArrayValue > 0)) {
            encoderName = "unknown";
        }
    }

    return [encoderName !== null, encoderName];
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

module.exports = {
    isObfuscatedCode
};

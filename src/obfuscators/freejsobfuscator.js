"use strict";

// Require Third-party Dependencies
const { Utils } = require("sec-literal");

function verify(analysis, prefix) {
    const pValue = Object.keys(prefix).pop();
    const regexStr = `^${Utils.escapeRegExp(pValue)}[a-zA-Z]{1,2}[0-9]{0,2}$`;

    return analysis.identifiersName.every(({ name }) => new RegExp(regexStr).test(name));
}

module.exports = {
    verify
};

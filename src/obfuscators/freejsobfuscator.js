"use strict";

function verify(analysis, prefix) {
    const pValue = Object.keys(prefix).pop();
    const regexStr = `^${escapeRegExp(pValue)}[a-zA-Z]{1,2}[0-9]{0,2}$`;

    return analysis.identifiersName.every(({ name }) => new RegExp(regexStr).test(name));
}

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = {
    verify
};

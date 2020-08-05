"use strict";

function getWarningKind(warnings) {
    return warnings.slice().map((warn) => warn.kind).sort();
}

module.exports = {
    getWarningKind
};

"use strict";

/**
 * This is one of the way to get a valid require.
 *
 * @see https://nodejs.org/api/process.html#process_process_mainmodule
 */
const processMainModuleRequire = "process.mainModule.require";

/**
 * JavaScript dangerous global identifiers that can be used by hackers
 */
const globalIdentifiers = new Set(["global", "globalThis", "root", "GLOBAL", "window"]);

/**
 * Dangerous Global identifiers parts
 */
const globalParts = new Set([...globalIdentifiers, "process", "mainModule", "require"]);

module.exports = {
    processMainModuleRequire,
    globalIdentifiers,
    globalParts
};

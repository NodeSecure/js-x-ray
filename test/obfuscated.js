"use strict";

// Require Node.js Dependencies
const { readFileSync } = require("fs");
const { join } = require("path");

// Require Internal Dependencies
const { runASTAnalysis, CONSTANTS: { Warnings } } = require("..");
const { getWarningKind } = require("./utils");

// CONSTANTS
const FIXTURE_PATH = join(__dirname, "fixtures/obfuscated");

test("should detect 'jsfuck' obfuscation", () => {
    const trycatch = readFileSync(join(FIXTURE_PATH, "jsfuck.js"), "utf-8");
    const { warnings } = runASTAnalysis(trycatch);

    expect(warnings.length).toStrictEqual(1);
    expect(getWarningKind(warnings)).toStrictEqual([Warnings.obfuscatedCode].sort());
    expect(warnings[0].value).toStrictEqual("jsfuck");
});

test("should detect 'morse' obfuscation", () => {
    const trycatch = readFileSync(join(FIXTURE_PATH, "morse.js"), "utf-8");
    const { warnings } = runASTAnalysis(trycatch);

    expect(warnings.length).toStrictEqual(1);
    expect(getWarningKind(warnings)).toStrictEqual([Warnings.obfuscatedCode].sort());
    expect(warnings[0].value).toStrictEqual("morse");
});

test("should detect 'jjencode' obfuscation", () => {
    const trycatch = readFileSync(join(FIXTURE_PATH, "jjencode.js"), "utf-8");
    const { warnings } = runASTAnalysis(trycatch);

    expect(warnings.length).toStrictEqual(1);
    expect(getWarningKind(warnings)).toStrictEqual([Warnings.obfuscatedCode].sort());
    expect(warnings[0].value).toStrictEqual("jjencode");
});

test("should detect 'freejsobfuscator' obfuscation", () => {
    const trycatch = readFileSync(join(FIXTURE_PATH, "freejsobfuscator.js"), "utf-8");
    const { warnings } = runASTAnalysis(trycatch);

    expect(warnings.length).toStrictEqual(3);
    expect(getWarningKind(warnings)).toStrictEqual([
        Warnings.encodedLiteral, Warnings.encodedLiteral, Warnings.obfuscatedCode
    ].sort());
    expect(warnings[2].value).toStrictEqual("freejsobfuscator");
});

test("should detect 'obfuscator.io' obfuscation (with hexadecimal generator)", () => {
    const trycatch = readFileSync(join(FIXTURE_PATH, "obfuscatorio-hexa.js"), "utf-8");
    const { warnings } = runASTAnalysis(trycatch);

    expect(warnings.length).toStrictEqual(1);
    expect(getWarningKind(warnings)).toStrictEqual([
        Warnings.obfuscatedCode
    ].sort());
    expect(warnings[0].value).toStrictEqual("obfuscator.io");
});

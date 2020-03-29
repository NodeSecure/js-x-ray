"use strict";

const { join } = require("path");
const { readFileSync } = require("fs");
const { searchRuntimeDependencies } = require("./");
const isMinified = require("is-minified-code");


const str = readFileSync(join(__dirname, "cases", "ransomeware.js"), "utf-8");
console.log(isMinified(str));
const result = searchRuntimeDependencies(str);
console.log(result);


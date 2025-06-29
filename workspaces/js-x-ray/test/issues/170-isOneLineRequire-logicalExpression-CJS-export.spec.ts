// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

const validTestCases: [string, string[]][] = [
  ["module.exports = require('fs') || require('constants');", ["fs", "constants"]],
  ["module.exports = require('constants') ? require('fs') : require('foo');", ["constants", "fs", "foo"]],

  // should have at least one branch has a `require` callee
  ["module.exports = require('constants') || {};", ["constants"]],
  ["module.exports = {} || require('constants');", ["constants"]],
  ["module.exports = require('constants') ? require('fs') : {};", ["constants", "fs"]],
  ["module.exports = require('constants') ? {} : require('fs');", ["constants", "fs"]],

  // should apply to nested conditions
  ["module.exports = (require('constants') || {}) || (require('foo') || {});", ["constants", "foo"]],
  ["module.exports = require('constants') ? (require('fs') || {}) : ({} || require('foo'));", ["constants", "fs", "foo"]],
  ["module.exports = require('constants') ? ({} || require('fs')) : (require('foo') || {});", ["constants", "fs", "foo"]],
  ["module.exports = require('constants') ? (require('fs') ? {} : require('bar')) : {};", ["constants", "fs", "bar"]],
  ["module.exports = require('constants') ? {} : (require('fs') ? {} : require('bar'));", ["constants", "fs", "bar"]],

  // test condition that are not `require` callees, here `notRequire('someModule')`, are ignored
  ["module.exports = notRequire('someModule') ? require('constants') : require('foo');",
    ["constants", "foo"]
  ],
  ["module.exports = ok ? (notRequire('someModule') ? require('constants') : require('foo')) : {};",
    ["constants", "foo"]
  ],
  ["module.exports = ok ? {} : (notRequire('someModule') ? require('constants') : require('foo'));",
    ["constants", "foo"]
  ]
];

test("it should return isOneLineRequire true given a single line CJS export with a valid assignment", () => {
  validTestCases.forEach((test) => {
    const [source, modules] = test;
    const { dependencies, flags } = new AstAnalyser().analyse(source);

    assert.ok(flags.has("oneline-require"));
    assert.deepEqual([...dependencies.keys()], modules);
  });
});

const invalidTestCases: [string, string[]][] = [
  // should have at least one `require` callee
  ["module.exports = notRequire('foo') || {};", []],
  ["module.exports = {} || notRequire('foo');", []],
  ["module.exports = require('constants') ? {} : {};", ["constants"]],

  // same behavior should apply to nested conditions
  ["module.exports = (notRequire('foo') || {}) || (notRequire('foo') || {});", []],
  ["module.exports = require('constants') ? (notRequire('foo') || {}) : (notRequire('foo') || {});", ["constants"]],
  ["module.exports = require('constants') ? (notRequire('foo') || {}) : (notRequire('foo') || {});", ["constants"]],
  ["module.exports = require('constants') ? (require('constants') ? {} : {}) : (require('constants') ? {} : {});", ["constants"]]
];

test("it should return isOneLineRequire false given a single line CJS export with illegal callees", () => {
  invalidTestCases.forEach((test) => {
    const [source, modules] = test;
    const { dependencies, flags } = new AstAnalyser().analyse(source);

    assert.ok(flags.has("oneline-require") === false);
    assert.deepEqual([...dependencies.keys()], modules);
  });
});

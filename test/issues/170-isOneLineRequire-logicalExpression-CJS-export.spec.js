// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../../index.js";

const validTestCases = [
  ["module.exports = require('fs') || require('constants');", ["fs", "constants"]],
  ["module.exports = foo === foo ? require('fs').constants.foo || require('constants') : require('someModule');",
    ["fs", "constants", "someModule"]
  ],
  ["module.exports = !ok ? require('fs') : require('someModule').constants.foo || require('constants');",
    ["fs", "someModule", "constants"]
  ],
  ["module.exports = !ok ? require('fs') : require('someModule').constants.foo ? require('constants') : require('foo');",
    ["fs", "someModule", "constants", "foo"]
  ],
  // Actually, if dependencies are equal or less than one, leaves that are not require callees are ignored
  ["module.exports = notRequire('fs') || require('constants');", ["constants"]],

  // test condition that are not `require` callees, here `notRequire('someModule')`, are ignored
  ["module.exports = !ok ? require('fs') : notRequire('someModule') ? require('constants') : require('foo');",
    ["fs", "constants", "foo"]
  ]
];

test("it should return isOneLineRequire true given a single line CJS export with a valid assignment", () => {
  validTestCases.forEach((test) => {
    const [source, modules] = test;
    const { dependencies, isOneLineRequire } = runASTAnalysis(source);

    assert.ok(isOneLineRequire);
    assert.deepEqual([...dependencies.keys()], modules);
  });
});

const invalidTestCases = [
  ["module.exports = foo === foo ? require('fs').constants.foo || notRequire('constants') : require('someModule');",
    ["fs", "someModule"]
  ],
  ["module.exports = !ok ? notRequire('fs') : require('someModule').constants.foo || require('constants');",
    ["someModule", "constants"]
  ],
  ["module.exports = !ok ? require('fs') : require('someModule') ? notRequire('constants') : require('foo');",
    ["fs", "someModule", "foo"]
  ]
];

test("it should return isOneLineRequire false given a single line CJS export with illegal callees", () => {
  invalidTestCases.forEach((test) => {
    const [source, modules] = test;
    const { dependencies, isOneLineRequire } = runASTAnalysis(source);

    assert.ok(isOneLineRequire === false);
    assert.deepEqual([...dependencies.keys()], modules);
  });
});

// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { getSubMemberExpressionSegments } from "../../src/utils/index.js";

describe("getSubMemberExpressionSegments", () => {
  test("given a MemberExpression then it should return each segments (except the last one)", () => {
    const iter = getSubMemberExpressionSegments("foo.bar.xd");

    const iterResult = new IteratorMatcher()
      .expect("foo")
      .expect("foo.bar")
      .execute(iter, { allowNoMatchingValues: false });

    assert.strictEqual(iterResult.isMatching, true);
    assert.strictEqual(iterResult.elapsedSteps, 2);
  });
});

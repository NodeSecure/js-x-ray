// Import Third-party Dependencies
import test from "tape";
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { getSubMemberExpressionSegments } from "../../src/utils/index.js";

test("given a MemberExpression then it should return each segments (except the last one)", (tape) => {
  const iter = getSubMemberExpressionSegments("foo.bar.xd");

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("foo.bar")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 2);
  tape.end();
});

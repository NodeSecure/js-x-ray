/**
 * @param {!string} str
 * @returns {IterableIterator<string>}
 */
export function* getSubMemberExpressionSegments(memberExpressionFullpath) {
  const identifiers = memberExpressionFullpath.split(".");
  const segments = [];

  for (let i = 0; i < identifiers.length - 1; i++) {
    segments.push(identifiers[i]);
    yield segments.join(".");
  }
}

export function* getSubMemberExpressionSegments(
  memberExpressionFullpath: string
): IterableIterator<string> {
  const identifiers = memberExpressionFullpath.split(".");
  const segments: string[] = [];

  for (let i = 0; i < identifiers.length - 1; i++) {
    segments.push(identifiers[i]);
    yield segments.join(".");
  }
}

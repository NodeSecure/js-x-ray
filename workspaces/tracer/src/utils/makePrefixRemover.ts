
export function makePrefixRemover(
  prefixes: Iterable<string>
): (expr: string) => string {
  return (
    expr
  ) => {
    if (!expr.includes(".")) {
      return expr;
    }

    const matchedPrefix = Array.from(prefixes)
      .find((globalId) => expr.startsWith(globalId));

    return matchedPrefix ?
      expr.slice(matchedPrefix.length + 1) :
      expr;
  };
}

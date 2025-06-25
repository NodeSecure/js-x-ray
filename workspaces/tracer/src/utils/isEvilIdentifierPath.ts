export function isEvilIdentifierPath(
  identifier: string
): boolean {
  return isFunctionPrototype(identifier);
}

export function isNeutralCallable(
  identifier: string
): boolean {
  return identifier === "Function.prototype.call";
}

function isFunctionPrototype(
  identifier: string
): boolean {
  return identifier.startsWith("Function.prototype")
    && /call|apply|bind/i.test(identifier);
}

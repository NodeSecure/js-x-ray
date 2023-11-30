/**
 * @param {!string} identifier
 */
export function isEvilIdentifierPath(identifier) {
  return isFunctionPrototype(identifier);
}

export function isNeutralCallable(identifier) {
  return identifier === "Function.prototype.call";
}

/**
 * @param {!string} identifier
 */
function isFunctionPrototype(identifier) {
  return identifier.startsWith("Function.prototype")
    && /call|apply|bind/i.test(identifier);
}

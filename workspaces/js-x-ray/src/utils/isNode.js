export function isNode(value) {
  return (
    value !== null && typeof value === "object" && "type" in value && typeof value.type === "string"
  );
}

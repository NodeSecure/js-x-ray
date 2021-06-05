export function getWarningKind(warnings) {
  return warnings.slice().map((warn) => warn.kind).sort();
}

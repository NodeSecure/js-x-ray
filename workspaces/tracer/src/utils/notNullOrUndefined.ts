export function notNullOrUndefined(
  value: any
): value is NonNullable<any> {
  return value !== null && value !== void 0;
}

export function notNullOrUndefined<T>(
  value: T
): value is NonNullable<T> {
  return value !== null && value !== void 0;
}

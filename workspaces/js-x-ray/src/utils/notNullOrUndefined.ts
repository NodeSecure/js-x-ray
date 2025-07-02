export function notNullOrUndefined<T = any>(
  value: T
): value is NonNullable<T> {
  return value !== null && value !== void 0;
}

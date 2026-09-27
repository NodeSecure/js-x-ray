export function classifyHardcodedSecret(
  value: string,
  name: string,
  minLength: number
): string {
  return Buffer.byteLength(value) < minLength ?
    `short-${name}` :
    `hardcoded-${name}`;
}

export interface ClassifyHardcodedSecretOptions {
  /**
   * Name of the parameter, used to build the reason.
   * @example "salt" // => "short-salt" | "hardcoded-salt"
   */
  name: string;
  /**
   * Minimum recommended length, in bytes.
   */
  minLength: number;
}

/**
 * @description
 * Classify a statically known salt or nonce. Hardcoding one is always a
 * finding; being shorter than the recommended length is the worse of the two.
 */
export function classifyHardcodedSecret(
  value: string,
  options: ClassifyHardcodedSecretOptions
): string {
  const { name, minLength } = options;

  return Buffer.byteLength(value) < minLength ?
    `short-${name}` :
    `hardcoded-${name}`;
}

export interface DefaultOptions {
  externalIdentifierLookup?(name: string): string | null;
}

export function noop(_name: string): string | null {
  return null;
}

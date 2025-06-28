
export {
  Warning,
  WarningDefault,
  WarningLocation,
  WarningName,
  WarningNameWithValue
}

type WarningNameWithValue = "parsing-error"
| "encoded-literal"
| "unsafe-regex"
| "unsafe-stmt"
| "short-identifiers"
| "suspicious-literal"
| "suspicious-file"
| "obfuscated-code"
| "weak-crypto"
| "shady-link"
| "unsafe-command";
type WarningName = WarningNameWithValue | "unsafe-import";

type WarningLocation = [[number, number], [number, number]];

interface WarningDefault<T = WarningName> {
  kind: T;
  file?: string;
  value: string;
  source: string;
  location: null | WarningLocation | WarningLocation[];
  i18n: string;
  severity: "Information" | "Warning" | "Critical";
  experimental?: boolean;
}

type Warning<T extends WarningDefault = WarningDefault> =
  T extends { kind: WarningNameWithValue } ? T : Omit<T, "value">;

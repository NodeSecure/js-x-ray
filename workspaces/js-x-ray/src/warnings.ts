// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { notNullOrUndefined } from "./utils/notNullOrUndefined.ts";
import {
  rootLocation,
  toArrayLocation,
  type SourceArrayLocation
} from "./utils/toArrayLocation.ts";

export type OptionalWarningName =
  | "synchronous-io";

export type WarningName =
  | "parsing-error"
  | "encoded-literal"
  | "unsafe-regex"
  | "unsafe-stmt"
  | "short-identifiers"
  | "suspicious-literal"
  | "suspicious-file"
  | "obfuscated-code"
  | "weak-crypto"
  | "shady-link"
  | "unsafe-command"
  | "unsafe-import"
  | "serialize-environment"
  | "data-exfiltration"
  | OptionalWarningName;

export interface Warning<T = WarningName> {
  kind: T | (string & {});
  file?: string;
  value: string | null;
  source: string;
  location: null | SourceArrayLocation | SourceArrayLocation[];
  i18n: string;
  severity: "Information" | "Warning" | "Critical";
  experimental?: boolean;
}

export const warnings = Object.freeze({
  "parsing-error": {
    i18n: "sast_warnings.parsing_error",
    severity: "Information",
    experimental: false
  },
  "unsafe-import": {
    i18n: "sast_warnings.unsafe_import",
    severity: "Warning",
    experimental: false
  },
  "unsafe-regex": {
    i18n: "sast_warnings.unsafe_regex",
    severity: "Warning",
    experimental: false
  },
  "unsafe-stmt": {
    i18n: "sast_warnings.unsafe_stmt",
    severity: "Warning",
    experimental: false
  },
  "encoded-literal": {
    i18n: "sast_warnings.encoded_literal",
    severity: "Information",
    experimental: false
  },
  "short-identifiers": {
    i18n: "sast_warnings.short_identifiers",
    severity: "Warning",
    experimental: false
  },
  "suspicious-literal": {
    i18n: "sast_warnings.suspicious_literal",
    severity: "Warning",
    experimental: false
  },
  "suspicious-file": {
    i18n: "sast_warnings.suspicious_file",
    severity: "Critical",
    experimental: false
  },
  "obfuscated-code": {
    i18n: "sast_warnings.obfuscated_code",
    severity: "Critical",
    experimental: true
  },
  "weak-crypto": {
    i18n: "sast_warnings.weak_crypto",
    severity: "Information",
    experimental: false
  },
  "shady-link": {
    i18n: "sast_warnings.shady_link",
    severity: "Warning",
    experimental: false
  },
  "unsafe-command": {
    i18n: "sast_warnings.unsafe_command",
    severity: "Warning",
    experimental: true
  },
  "synchronous-io": {
    i18n: "sast_warnings.synchronous_io",
    severity: "Warning",
    experimental: true
  },
  "serialize-environment": {
    i18n: "sast_warnings.serialize_environment",
    severity: "Warning",
    experimental: false
  },
  "data-exfiltration": {
    i18n: "sast_warnings.data_exfiltration",
    severity: "Warning",
    experimental: false
  }
}) satisfies Record<WarningName, Pick<Warning, "experimental" | "i18n" | "severity">>;

export interface GenerateWarningOptions {
  location?: ESTree.SourceLocation | null;
  file?: string | null;
  value: string | null;
  source?: string;
  /**
   * Override the default severity level for this warning
   */
  severity?: "Information" | "Warning" | "Critical";
}

export function generateWarning<T extends WarningName>(
  kind: T,
  options: GenerateWarningOptions
): Warning<T> {
  const {
    file = null,
    value,
    source = "JS-X-Ray",
    severity = warnings[kind].severity
  } = options;
  const location = options.location ?? rootLocation();

  if (kind === "encoded-literal") {
    return {
      kind,
      value,
      location: [toArrayLocation(location)],
      source,
      ...warnings[kind]
    };
  }

  return {
    kind,
    location: toArrayLocation(location),
    source,
    ...warnings[kind],
    severity,
    ...(notNullOrUndefined(file) ? { file } : {}),
    ...(notNullOrUndefined(value) ? { value } : { value: null })
  };
}


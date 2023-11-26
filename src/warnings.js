// Import Internal Dependencies
import * as utils from "./utils.js";

export const warnings = Object.freeze({
  "parsing-error": {
    i18n: "sast_warnings.parsing_error",
    severity: "Information"
  },
  "unsafe-import": {
    i18n: "sast_warnings.unsafe_import",
    severity: "Warning"
  },
  "unsafe-regex": {
    i18n: "sast_warnings.unsafe_regex",
    severity: "Warning"
  },
  "unsafe-stmt": {
    code: "unsafe-stmt",
    i18n: "sast_warnings.unsafe_stmt",
    severity: "Warning"
  },
  "encoded-literal": {
    i18n: "sast_warnings.encoded_literal",
    severity: "Information"
  },
  "short-identifiers": {
    i18n: "sast_warnings.short_identifiers",
    severity: "Warning"
  },
  "suspicious-literal": {
    i18n: "sast_warnings.suspicious_literal",
    severity: "Warning"
  },
  "suspicious-file": {
    i18n: "sast_warnings.suspicious_file",
    severity: "Critical",
    experimental: true
  },
  "obfuscated-code": {
    i18n: "sast_warnings.obfuscated_code",
    severity: "Critical",
    experimental: true
  },
  "weak-crypto": {
    i18n: "sast_warnings.weak_crypto",
    severity: "Information",
    experimental: true
  },
  "shady-link": {
    i18n: "sast_warnings.shady_link",
    severity: "Warning",
    experimental: true
  }
});

export function generateWarning(kind, options) {
  const { location, file = null, value = null, source = "JS-X-Ray" } = options;

  if (kind === "encoded-literal") {
    return Object.assign(
      { kind, value, location: [utils.toArrayLocation(location)], source },
      warnings[kind]
    );
  }

  const result = { kind, location: utils.toArrayLocation(location), source };
  if (utils.notNullOrUndefined(file)) {
    result.file = file;
  }
  if (utils.notNullOrUndefined(value)) {
    result.value = value;
  }

  return Object.assign(result, warnings[kind]);
}


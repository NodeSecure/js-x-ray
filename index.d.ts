declare class ASTDeps {
  constructor();
  removeByName(name: string): void;
  add(depName: string): void;
  getDependenciesInTryStatement(): IterableIterator<string>;

  public isInTryStmt: boolean;
  public dependencies: Record<string, JSXRay.Dependency>;
  public readonly size: number;
}

declare namespace JSXRay {
  type kindWithValue = "parsing-error"
    | "encoded-literal"
    | "unsafe-regex"
    | "unsafe-stmt"
    | "unsafe-assign"
    | "short-identifiers"
    | "suspicious-literal"
    | "obfuscated-code"
    | "weak-crypto";

  type WarningLocation = [[number, number], [number, number]];
  interface BaseWarning {
    kind: "unsafe-import" | kindWithValue;
    file?: string;
    value: string;
    location: WarningLocation | WarningLocation[];
  }

  type Warning<T extends BaseWarning> = T extends { kind: kindWithValue } ? T : Omit<T, "value">;

  interface Report {
    dependencies: ASTDeps;
    warnings: Warning<BaseWarning>[];
    idsLengthAvg: number;
    stringScore: number;
    isOneLineRequire: boolean;
  }

  interface SourceLocation {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    }
  }

  interface Dependency {
    unsafe: boolean;
    inTry: boolean;
    location?: SourceLocation;
  }

  interface WarningsNames {
    parsingError: {
      code: "ast-error",
      i18n: "sast_warnings.ast_error",
      severity: "Information"
    },
    unsafeImport: {
      code: "unsafe-import",
      i18n: "sast_warnings.unsafe_import",
      severity: "Warning"
    },
    unsafeRegex: {
      code: "unsafe-regex",
      i18n: "sast_warnings.unsafe_regex",
      severity: "Warning"
    },
    unsafeStmt: {
      code: "unsafe-stmt",
      i18n: "sast_warnings.unsafe_stmt",
      severity: "Warning"
    },
    unsafeAssign: {
      code: "unsafe-assign",
      i18n: "sast_warnings.unsafe_assign",
      severity: "Warning"
    },
    encodedLiteral: {
      code: "encoded-literal",
      i18n: "sast_warnings.encoded_literal",
      severity: "Information"
    },
    shortIdentifiers: {
      code: "short-identifiers",
      i18n: "sast_warnings.short_identifiers",
      severity: "Warning"
    },
    suspiciousLiteral: {
      code: "suspicious-literal",
      i18n: "sast_warnings.suspicious_literal",
      severity: "Warning"
    },
    obfuscatedCode: {
      code: "obfuscated-code",
      i18n: "sast_warnings.obfuscated_code",
      severity: "Critical"
    },
    weakCrypto: {
      code: "weak-crypto",
      i18n: "sast_warnings.weak_crypto",
      severity: "Information",
      experimental: true
   }
  }

  interface RuntimeOptions {
    module?: boolean;
    isMinified?: boolean;
  }

  export function runASTAnalysis(str: string, options?: RuntimeOptions): Report;

  export type ReportOnFile = {
    ok: true,
    warnings: Warning<BaseWarning>[];
    dependencies: ASTDeps;
    isMinified: boolean;
  } | {
    ok: false,
    warnings: Warning<BaseWarning>[];
  }

  export interface RuntimeFileOptions {
    packageName?: string;
    module?: boolean;
  }

  export function runASTAnalysisOnFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;

  export const warnings: WarningsNames;
}

export = JSXRay;
export as namespace JSXRay;

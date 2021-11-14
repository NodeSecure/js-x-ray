/// <reference types="meriyah"/>

import { SourceLocation } from "meriyah/dist/estree";

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
    | "obfuscated-code";

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

  interface Dependency {
    unsafe: boolean;
    inTry: boolean;
    location?: SourceLocation;
  };

  interface WarningsNames {
    parsingError: "parsing-error",
    unsafeImport: "unsafe-import",
    unsafeStmt: "unsafe-stmt",
    unsafeRegex: "unsafe-regex",
    unsafeAssign: "unsafe-assign",
    encodedLiteral: "encoded-literal",
    shortIdentifiers: "short-identifiers",
    suspiciousLiteral: "suspicious-literal",
    obfuscatedCode: "obfuscated-code"
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

  export function runASTAnalysisOnFile(pathToFile: string, options?: { packageName?: string }): Promise<ReportOnFile>;

  export namespace CONSTANTS {
    export const Warnings: WarningsNames;
  }
}

export = JSXRay;
export as namespace JSXRay;

/// <reference types="meriyah"/>

import { SourceLocation } from "meriyah/dist/estree";

declare class ASTDeps {
    constructor();
    removeByName(name: string): void;
    add(depName: string): void;
    getDependenciesInTryStatement(): IterableIterator<string>;

    public isInTryStmt: boolean;
    public dependencies: JSXRay.Dependencies;
    public readonly size: number;
}

declare namespace JSXRay {
    interface RuntimeOptions {
        module?: boolean;
        isMinified?: boolean;
    }

    interface WarningOptions {
        location: { start: number, end?: number }
        file?: string | null,
        value?: string | null
    }

    type kindWithValue = "ast-error" | "hexa-value" | "unsafe-regex" | "unsafe-stmt" | "short-ids" | "suspicious-string";
    interface BaseWarning {
        file: string | null;
        kind: "unsafe-import" | kindWithValue;
        value: string;
        start: { line: number; column: number };
        end: { line: number; column: number };
    }

    type Warning<T extends BaseWarning> = T extends { kind: kindWithValue } ? T : Omit<T, "value">;

    interface Report {
        dependencies: ASTDeps;
        warnings: Warning<BaseWarning>[];
        idsLengthAvg: number;
        stringScore: number;
        isOneLineRequire: boolean;
    }

    interface Dependencies {
        [depName: string]: {
            unsafe: boolean;
            inTry: boolean;
            location?: SourceLocation;
        }
    }

    export function runASTAnalysis(str: string, options?: RuntimeOptions): Report;
    export function generateWarning(kind?: string, options?: WarningOptions);
    export function rootLocation(): any;
}

export = JSXRay;
export as namespace JSXRay;

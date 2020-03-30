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
    }

    interface WarningOptions {
        location: { start: number, end?: number }
        file?: string | null,
        value?: string | null
    }

    interface BaseWarning {
        file: string | null;
        kind: "unsafe-import" | "unsafe-regex" | "ast-error" | "hexa-value" | "short-ids";
        value: string;
        start: { line: number; column: number };
        end: { line: number; column: number };
    }

    type Warning<T extends BaseWarning> = T extends { kind: "ast-error" | "hexa-value" | "unsafe-regex" } ? T : Omit<T, "value">;

    interface Report {
        dependencies: ASTDeps;
        warnings: Warning[];
        idsLengthAvg: number;
        isOneLineRequire: boolean;
    }

    interface Dependencies {
        [depName: string]: {
            inTry: boolean;
            location?: SourceLocation;
        }
    }

    export function searchRuntimeDependencies(str: string, options?: RuntimeOptions): Report;
    export function generateWarning(kind?: string, options: WarningOptions);
}

export = JSXRay;
export as namespace JSXRay;

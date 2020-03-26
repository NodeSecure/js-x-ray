declare class ASTDeps {
    constructor();
    removeByName(name: string): void;
    add(depName: string): void;
    getDependenciesInTryStatement(): IterableIterator<string>;

    public isInTryStmt: boolean;
    public dependencies: object;
    public readonly size: number;
}

declare namespace JSXRay {
    interface RuntimeOptions {
        module?: boolean;
    }
    interface Warning {
        file: string;
        kind: "unsafe-import" | "unsafe-regex" | "ast-error";
        error?: string;
        start: { line: number; column: number };
        end: { line: number; column: number };
    }
    interface Report {
        dependencies: ASTDeps;
        warnings: Warning[];
        isOneLineRequire: boolean;
    }

    export function searchRuntimeDependencies(str: string, options?: RuntimeOptions): Report;
    export function generateWarning(kind?: string, loc?: { start?: number, end?: number });
}

export = JSXRay;
export as namespace JSXRay;

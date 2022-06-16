export {
  ASTDeps,
  SourceLocation
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

declare class ASTDeps {
  constructor();
  removeByName(name: string): void;
  add(depName: string): void;
  getDependenciesInTryStatement(): IterableIterator<string>;

  public isInTryStmt: boolean;
  public dependencies: Record<string, {
    unsafe: boolean;
    inTry: boolean;
    location?: SourceLocation;
  }>;
  public readonly size: number;
}

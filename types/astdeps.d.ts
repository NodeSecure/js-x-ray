export {
  ASTDeps,
  SourceLocation,
  Dependency
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

declare class ASTDeps {
  constructor();
  removeByName(name: string): void;
  add(depName: string): void;
  getDependenciesInTryStatement(): IterableIterator<string>;
  [Symbol.iterator]: IterableIterator<string>;

  public isInTryStmt: boolean;
  public dependencies: Record<string, Dependency>;
  public readonly size: number;
}

// Import Node.js Dependencies
import EventEmitter from "node:events";

export interface DataIdentifierOptions {
  /**
   * @default false
   */
  removeGlobalIdentifier?: boolean;
}

declare class VariableTracer extends EventEmitter {
  static AssignmentEvent: Symbol;

  literalIdentifiers: Map<string, string>;
  importedModules: Set<string>;

  enableDefaultTracing(): VariableTracer;
  debug(): void;
  trace(identifierOrMemberExpr: string, options?: {
    followConsecutiveAssignment?: boolean;
    moduleName?: string;
    name?: string;
  }): VariableTracer;
  removeGlobalIdentifier(identifierOrMemberExpr: string): string;
  getDataFromIdentifier(identifierOrMemberExpr: string, options: DataIdentifierOptions): null | {
    name: string;
    identifierOrMemberExpr: string;
    assignmentMemory: string[];
  };
  walk(node: any): void;
}

export {
  VariableTracer
}

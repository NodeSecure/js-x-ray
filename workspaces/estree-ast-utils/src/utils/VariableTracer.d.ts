// Import Node.js Dependencies
import EventEmitter from "node:events";

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
  getDataFromIdentifier(identifierOrMemberExpr: string): null | {
    name: string;
    identifierOrMemberExpr: string;
    assignmentMemory: string[];
  }
  walk(node: any): void;
}

export {
  VariableTracer
}

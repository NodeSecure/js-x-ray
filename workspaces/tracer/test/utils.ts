// Import Third-party Dependencies
import { walk } from "estree-walker";
import * as meriyah from "meriyah";

// Import Internal Dependencies
import { VariableTracer, type AssignmentEventPayload, type ImportEventPayload } from "../src/index.ts";

function codeToAst(code: string) {
  const estreeRootNode = meriyah.parse(code, {
    next: true,
    loc: true,
    raw: true,
    sourceType: "module"
  });

  return estreeRootNode.body;
}

export interface WalkOnAstOptions {
  debugAst?: boolean;
}

export function createTracer(enableDefaultTracing = false) {
  const tracer = new VariableTracer();
  if (enableDefaultTracing) {
    tracer.enableDefaultTracing();
  }

  return {
    tracer,
    walkOnAst(astNode: any) {
      walk(astNode, {
        enter(node: any) {
          tracer.walk(node);
        }
      });
    },
    walkOnCode(codeStr: string, options: WalkOnAstOptions = {}): void {
      const { debugAst = false } = options;

      const astNode = codeToAst(codeStr);
      if (debugAst) {
        console.log(JSON.stringify(astNode, null, 2));
      }

      this.walkOnAst(astNode);
    },
    getAssignmentArray(event = VariableTracer.AssignmentEvent) {
      const assignmentEvents: AssignmentEventPayload[] = [];
      tracer.on(event, (value: AssignmentEventPayload) => assignmentEvents.push(value));

      return assignmentEvents;
    },

    getImportArray(event = VariableTracer.ImportEvent) {
      const importEvents: ImportEventPayload[] = [];
      tracer.on(event, (value: ImportEventPayload) => importEvents.push(value));

      return importEvents;
    }
  };
}

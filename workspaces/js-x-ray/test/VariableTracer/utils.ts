// Import Internal Dependencies
import {
  VariableTracer,
  type AssignmentEventPayload,
  type ImportEventPayload
} from "../../src/VariableTracer.ts";
import { walk } from "../../src/walker/index.ts";
import { parseScript } from "../helpers.ts";

export interface WalkOnAstOptions {
  debugAst?: boolean;
}

export function createTracer(
  enableDefaultTracing = false
) {
  const tracer = new VariableTracer();
  if (enableDefaultTracing) {
    tracer.enableDefaultTracing();
  }

  return {
    tracer,
    walkOnCode(
      codeStr: string,
      options: WalkOnAstOptions = {}
    ): void {
      const { debugAst = false } = options;

      const astNode = parseScript(codeStr).body;
      if (debugAst) {
        console.log(JSON.stringify(astNode, null, 2));
      }

      walk(astNode, {
        enter(node: any) {
          tracer.walk(node);
        }
      });
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

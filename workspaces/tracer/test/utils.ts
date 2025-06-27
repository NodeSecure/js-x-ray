// Import Third-party Dependencies
import * as meriyah from "meriyah";
import { walk } from "estree-walker";

// Import Internal Dependencies
import { VariableTracer } from "../src/index.js";

function codeToAst(code: string) {
  const estreeRootNode = meriyah.parseScript(code, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
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
      const assignmentEvents: any[] = [];
      tracer.on(event, (value) => assignmentEvents.push(value));

      return assignmentEvents;
    }
  };
}

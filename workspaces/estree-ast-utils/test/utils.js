// Import Third-party Dependencies
import * as meriyah from "meriyah";
import { walk } from "estree-walker";

// Import Internal Dependencies
import { VariableTracer } from "../src/index.js";

export function codeToAst(code) {
  const estreeRootNode = meriyah.parseScript(code, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
  });

  return estreeRootNode.body;
}

export function getExpressionFromStatement(node) {
  return node.type === "ExpressionStatement" ? node.expression : null;
}

export function createTracer(enableDefaultTracing = false) {
  const tracer = new VariableTracer();
  if (enableDefaultTracing) {
    tracer.enableDefaultTracing();
  }

  return {
    tracer,
    walkOnAst(astNode) {
      walk(astNode, {
        enter(node) {
          tracer.walk(node);
        }
      });
    },
    /**
     * @param {!string} codeStr
     * @param {object} [options]
     * @param {boolean} [options.debugAst=false]
     * @returns {void}
     */
    walkOnCode(codeStr, options = {}) {
      const { debugAst = false } = options;

      const astNode = codeToAst(codeStr);
      if (debugAst) {
        console.log(JSON.stringify(astNode, null, 2));
      }

      this.walkOnAst(astNode);
    },
    getAssignmentArray(event = VariableTracer.AssignmentEvent) {
      const assignmentEvents = [];
      tracer.on(event, (value) => assignmentEvents.push(value));

      return assignmentEvents;
    }
  };
}

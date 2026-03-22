// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import {
  isLiteral
} from "../estree/types.ts";
import { generateWarning } from "../warnings.ts";

const tracedFunctions = new Set([
  "crypto.scrypt"
]);

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("crypto")) {
    return [false];
  }

  return [
    tracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  for (const identifierOrMemberExpr of tracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;
  const salt = node.arguments.at(1);
  const options = node.arguments.at(3);

  if (options && options.type === "ObjectExpression") {                              
    for (const p of options.properties) {                                            
      if (                                                                           
        p.type === "Property"                                                        
        && p.key.type === "Identifier"                                               
        && p.key.name === "cost"                                                     
        && p.value.type === "Literal"                                                
        && typeof p.value.value === "number"
        && p.value.value < 16384                                                     
      ) {                                                                            
        sourceFile.warnings.push(generateWarning("weak-scrypt", {                    
          value: "low-cost",                                                         
          location: node.loc                                                         
        }));                                                                         
        break;                                                                       
      }                                                                              
    }             
  }      

  if (isLiteral(salt)) {
    if (typeof salt.value === "string" && salt.value.length < 16) {
      sourceFile.warnings.push(generateWarning("weak-scrypt", {
        value: "short-salt",
        location: node.loc
      }));
    }
    else {
      sourceFile.warnings.push(generateWarning("weak-scrypt", {
        value: "hardcoded-salt",
        location: node.loc
      }));
    }
  }
}

export default {
  name: "isWeakScrypt",
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};

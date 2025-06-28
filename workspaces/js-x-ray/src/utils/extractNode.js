// Import Internal Dependencies
import { notNullOrUndefined } from "./notNullOrUndefined.js";

export function extractNode(expectedType) {
  return (callback, nodes) => {
    const finalNodes = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of finalNodes) {
      if (notNullOrUndefined(node) && node.type === expectedType) {
        callback(node);
      }
    }
  };
}

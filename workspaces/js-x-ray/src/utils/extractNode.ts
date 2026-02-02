// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isNode } from "../estree/types.ts";

export type NodeExtractorCallback<T> = (node: T) => void;
export type NodeOrNull = ESTree.Node | null;

export function extractNode<T extends ESTree.Node>(
  expectedType: T["type"]
) {
  return (callback: NodeExtractorCallback<T>, nodes: NodeOrNull | NodeOrNull[]) => {
    const finalNodes = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of finalNodes) {
      if (isNode(node) && node.type === expectedType) {
        callback(node as T);
      }
    }
  };
}

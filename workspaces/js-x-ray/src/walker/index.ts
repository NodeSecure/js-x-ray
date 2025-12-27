// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SyncWalker, type SyncHandler } from "./walker.sync.ts";

export type WalkRootNode = ESTree.Program | ESTree.Program["body"] | ESTree.Node;

export function walk(
  ast: WalkRootNode,
  { enter, leave }: { enter?: SyncHandler; leave?: SyncHandler; } = {}
) {
  const instance = new SyncWalker(enter, leave);

  return instance.visit(
    ast as unknown as ESTree.Node,
    { parent: null }
  );
}

export function walkEnter(
  ast: WalkRootNode,
  enter: SyncHandler
): ESTree.Node | null {
  return walk(ast, { enter });
}

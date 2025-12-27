// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isNode } from "../types/estree.ts";
import { WalkerBase, type WalkerContext } from "./walker.base.ts";

export type SyncHandler = (
  this: WalkerContext,
  node: ESTree.Node,
  context: SyncWalkerVisitorContext
) => void;

export interface SyncWalkerVisitorContext {
  parent: ESTree.Node | null;
  prop?: string | number;
  index?: number | null;
}

export class SyncWalker extends WalkerBase {
  enter: SyncHandler | undefined;
  leave: SyncHandler | undefined;

  constructor(
    enter?: SyncHandler,
    leave?: SyncHandler
  ) {
    super();
    this.enter = enter;
    this.leave = leave;
  }

  visit(
    node: ESTree.Node,
    options: SyncWalkerVisitorContext
  ): ESTree.Node | null {
    if (!node) {
      return null;
    }

    const { parent, prop, index } = options;
    let returnedNode = node;

    if (this.enter) {
      const _should_skip = this.should_skip;
      const _should_remove = this.should_remove;
      const _replacement = this.replacement;
      this.should_skip = false;
      this.should_remove = false;
      this.replacement = null;

      this.enter.call(this.context, returnedNode, { parent, prop, index });

      if (this.replacement) {
        returnedNode = this.replacement;
        this.replace(parent, prop, index, returnedNode);
      }

      if (this.should_remove) {
        this.remove(parent, prop, index);
      }

      const skipped = this.should_skip;
      const removed = this.should_remove;

      this.should_skip = _should_skip;
      this.should_remove = _should_remove;
      this.replacement = _replacement;

      if (skipped) {
        return returnedNode;
      }
      if (removed) {
        return null;
      }
    }

    for (const key in returnedNode) {
      if (!Object.hasOwn(returnedNode, key)) {
        continue;
      }
      const value: unknown = returnedNode[key];

      if (Array.isArray(value)) {
        const nodes: unknown[] = value;
        for (let i = 0; i < nodes.length; i++) {
          const item = nodes[i];
          const removeItem = isNode(item) && !this.visit(item, { parent: returnedNode, prop: key, index: i });
          if (removeItem) {
            i--;
          }
        }
      }
      else if (isNode(value)) {
        this.visit(value, { parent: returnedNode, prop: key, index: null });
      }
    }

    if (this.leave) {
      const _replacement = this.replacement;
      const _should_remove = this.should_remove;
      this.replacement = null;
      this.should_remove = false;

      this.leave.call(this.context, returnedNode, { parent, prop, index });

      if (this.replacement) {
        returnedNode = this.replacement;
        this.replace(parent, prop, index, returnedNode);
      }

      if (this.should_remove) {
        this.remove(parent, prop, index);
      }

      const removed = this.should_remove;

      this.replacement = _replacement;
      this.should_remove = _should_remove;

      if (removed) {
        return null;
      }
    }

    return returnedNode;
  }
}

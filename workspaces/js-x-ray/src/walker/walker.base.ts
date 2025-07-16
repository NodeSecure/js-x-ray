// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export interface WalkerContext {
  skip: () => void;
  remove: () => void;
  replace: (node: ESTree.Node) => void;
}

export class WalkerBase {
  should_skip = false;
  should_remove = false;
  replacement: ESTree.Node | null = null;
  context: WalkerContext;

  constructor() {
    this.context = {
      skip: () => (this.should_skip = true),
      remove: () => (this.should_remove = true),
      replace: (node) => (this.replacement = node)
    };
  }

  // eslint-disable-next-line max-params
  replace(
    parent: ESTree.Node | null | undefined,
    prop: string | number | symbol | null | undefined,
    index: number | null | undefined,
    node: ESTree.Node
  ) {
    if (parent && prop) {
      if (index === null) {
        parent[prop] = node;
      }
      else {
        parent[prop][index] = node;
      }
    }
  }

  remove(
    parent: ESTree.Node | null | undefined,
    prop: string | number | symbol | null | undefined,
    index: number | null | undefined
  ) {
    if (parent && prop) {
      if (index !== null && index !== undefined) {
        parent[prop].splice(index, 1);
      }
      else {
        delete parent[prop];
      }
    }
  }
}

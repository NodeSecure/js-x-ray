// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isNode } from "./estree/types.ts";

function noop() {
  return true;
}

export type NodeCounterFilterCallback<T extends ESTree.Node> = (node: T) => boolean;
export type NodeCounterMatchCallback<T extends ESTree.Node> = (node: T, nc: NodeCounter<T>) => void;

export interface NodeCounterOptions<T extends ESTree.Node> {
  name?: string;
  filter?: NodeCounterFilterCallback<T>;
  match?: NodeCounterMatchCallback<T>;
}

export class NodeCounter<T extends ESTree.Node = ESTree.Node> {
  type: string;
  name: string;
  lookup: string | null = null;

  #count = 0;
  #properties: Map<string, number> | null = null;
  #filterFn: NodeCounterFilterCallback<T> = noop;
  #matchFn: NodeCounterMatchCallback<T> = noop;

  /**
   * @example
   * new NodeCounter("FunctionDeclaration");
   * new NodeCounter("VariableDeclaration[kind]");
   */
  constructor(
    type: string,
    options: NodeCounterOptions<T> = {}
  ) {
    if (typeof type !== "string") {
      throw new TypeError("type must be a string");
    }

    const typeResult = /([A-Za-z]+)(\[[a-zA-Z]+\])?/g.exec(type);
    if (typeResult === null) {
      throw new Error("invalid type argument syntax");
    }
    this.type = typeResult[1];
    this.lookup = typeResult[2]?.slice(1, -1) ?? null;
    this.name = options?.name ?? this.type;
    if (this.lookup) {
      this.#properties = new Map<string, number>();
    }

    this.#filterFn = options.filter ?? noop;
    this.#matchFn = options.match ?? noop;
  }

  get count(): number {
    return this.#count;
  }

  get properties(): Record<string, number> {
    return Object.fromEntries(
      this.#properties?.entries() ?? []
    );
  }

  walk(
    node: ESTree.Node
  ): void {
    if (!isNode(node) || node.type !== this.type) {
      return;
    }
    const castedNode = node as T;

    if (!this.#filterFn(castedNode)) {
      return;
    }

    this.#count++;
    if (this.lookup === null) {
      this.#matchFn(castedNode, this);
    }
    else if (this.lookup in node) {
      const key = node[this.lookup];
      this.#properties?.set(key, (this.#properties.get(key) ?? 0) + 1);
      this.#matchFn(castedNode, this);
    }
  }
}

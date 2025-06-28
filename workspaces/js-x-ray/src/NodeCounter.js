// Import Third-party Dependencies
import FrequencySet from "frequency-set";

// Import Internal Dependencies
import { isNode } from "./utils/index.js";

function noop() {
  return true;
}

export class NodeCounter {
  lookup = null;

  #count = 0;
  #properties = null;
  #filterFn = noop;
  #matchFn = noop;

  /**
   * @param {!string} type
   * @param {Object} [options]
   * @param {string} [options.name]
   * @param {(node: any) => boolean} [options.filter]
   * @param {(node: any, nc: NodeCounter) => void} [options.match]
   *
   * @example
   * new NodeCounter("FunctionDeclaration");
   * new NodeCounter("VariableDeclaration[kind]");
   */
  constructor(type, options = {}) {
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
      this.#properties = new FrequencySet();
    }

    this.#filterFn = options.filter ?? noop;
    this.#matchFn = options.match ?? noop;
  }

  get count() {
    return this.#count;
  }

  get properties() {
    return Object.fromEntries(
      this.#properties?.entries() ?? []
    );
  }

  walk(node) {
    if (!isNode(node) || node.type !== this.type) {
      return;
    }
    if (!this.#filterFn(node)) {
      return;
    }

    this.#count++;
    if (this.lookup === null) {
      this.#matchFn(node, this);
    }
    else if (this.lookup in node) {
      this.#properties.add(node[this.lookup]);
      this.#matchFn(node, this);
    }
  }
}

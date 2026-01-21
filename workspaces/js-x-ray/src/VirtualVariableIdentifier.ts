// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export type VirtualVariableLocation = ESTree.SourceLocation | null | undefined;

export class VirtualVariableIdentifier {
  static #idToLocations = new Map<string, VirtualVariableLocation>();
  static #counter = 0;

  static generate(
    name: string,
    location: VirtualVariableLocation = undefined
  ): string {
    const virtualId = `__virtual_${name}_${this.#counter++}__`;
    this.#idToLocations.set(virtualId, location);

    return virtualId;
  }

  static getLocation(
    virtualId: string
  ): VirtualVariableLocation {
    return this.#idToLocations.get(virtualId);
  }

  static reset(): void {
    this.#counter = 0;
    this.#idToLocations.clear();
  }
}

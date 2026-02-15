// Import Internal Dependencies
import type { CollectableSet, Type } from "./CollectableSet.ts";
import type { SourceArrayLocation } from "./utils/toArrayLocation.ts";

export class CollectableSetRegistry {
  #collectableSets: Map<Type, CollectableSet> = new Map();
  constructor(collectableSets: CollectableSet[]) {
    collectableSets.forEach((collectableSet) => {
      this.#collectableSets.set(collectableSet.type, collectableSet);
    });
  }

  add(type: Type, { value, file, location, metadata }: {
    value: string;
    file?: string | null;
    location: SourceArrayLocation;
    metadata?: Record<string, unknown>;
  }) {
    const collectableSet = this.#collectableSets.get(type);
    collectableSet?.add(value, { file, location, metadata });
  }

  has(type: Type): boolean {
    return this.#collectableSets.has(type);
  }

  get(type: Type): CollectableSet | undefined {
    return this.#collectableSets.get(type);
  }
}

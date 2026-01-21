// Import Internal Dependencies
import { CollectableSet } from "./CollectableSet.ts";
import type { SourceArrayLocation } from "./utils/toArrayLocation.ts";

export class CollectableSetRegistry {
  #collectableSets: Map<string, CollectableSet> = new Map();
  constructor(collectableSets: CollectableSet[]) {
    collectableSets.forEach((collectableSet) => {
      this.#collectableSets.set(collectableSet.type, collectableSet);
    });
  }

  add(type: string, { value, file, location, metadata }: {
    value: string;
    file?: string | null;
    location: SourceArrayLocation;
    metadata?: Record<string, unknown>;
  }) {
    const collectableSet = this.#collectableSets.get(type);
    collectableSet?.add(value, { file, location, metadata });
  }
}

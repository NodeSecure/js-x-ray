// Import Internal Dependencies
import { type SourceArrayLocation } from "./utils/toArrayLocation.ts";

export type Location = {
  file: string | null;
  location: SourceArrayLocation[];
};

export class CollectableSet {
  #entries: Map<string, Map<string | null, SourceArrayLocation[]>> = new Map();
  type: string;
  constructor(type: string) {
    this.type = type;
  }

  add(value: string, { file = null, location }: {
    file?: string | null;
    location: SourceArrayLocation;
  }) {
    if (!this.#entries.has(value)) {
      this.#entries.set(value, new Map([[file, [location]]]));

      return;
    }

    const files = this.#entries.get(value);

    if (files?.has(file)) {
      files?.get(file)?.push(location);

      return;
    }

    files?.set(file, [location]);
  }

  *[Symbol.iterator]() {
    for (const [value, files] of this.#entries) {
      const locations: Location[] = [];

      for (const [file, location] of files) {
        locations.push({
          file, location
        });
      }

      yield {
        value, locations
      };
    }
  }
}

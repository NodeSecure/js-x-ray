// Import Internal Dependencies
import { type SourceArrayLocation } from "./utils/toArrayLocation.ts";

export type Location<T = Record<string, unknown>> = {
  file: string | null;
  location: SourceArrayLocation[];
  metadata?: T;
};

export class CollectableSet<T = Record<string, unknown>> {
  #entries: Map<string, Map<string | null, { location: SourceArrayLocation; metadata?: T; }[]>> = new Map();
  type: string;
  constructor(type: string) {
    this.type = type;
  }

  add(value: string, { file = null, location, metadata }: {
    file?: string | null;
    metadata?: T;
    location: SourceArrayLocation;
  }) {
    if (!this.#entries.has(value)) {
      this.#entries.set(value, new Map([[file, [{ location, metadata }]]]));

      return;
    }

    const files = this.#entries.get(value);

    if (files?.has(file)) {
      files?.get(file)?.push({ location, metadata });

      return;
    }

    files?.set(file, [{ location, metadata }]);
  }

  * [Symbol.iterator]() {
    for (const [value, files] of this.#entries) {
      const locations: Location<T>[] = [];

      for (const [file, locs] of files) {
        for (const { location, metadata } of locs) {
          locations.push({
            file,
            location: [location],
            ...(metadata && { metadata })
          });
        }
      }

      yield {
        value, locations
      };
    }
  }
}

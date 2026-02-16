// Import Internal Dependencies
import { type SourceArrayLocation } from "./utils/toArrayLocation.ts";

export type Type = "url" | "hostname" | "ip" | "email" | "dependency" | (string & {});

export type Location<T = Record<string, unknown>> = {
  file: string | null;
  location: SourceArrayLocation[];
  metadata?: T;
};

export type CollectableInfos<T = Record<string, unknown>> = {
  file?: string | null;
  metadata?: T;
  location: SourceArrayLocation;
};

export interface CollectableSet<T = Record<string, unknown>> {
  add(value: string, infos: CollectableInfos<T>): void;
  type: Type;
  values(): Iterable<string>;
}

export class DefaultCollectableSet<T = Record<string, unknown>> implements CollectableSet<T> {
  #entries: Map<string, Map<string | null, { location: SourceArrayLocation; metadata?: T; }[]>> = new Map();
  type: Type;
  constructor(type: string) {
    this.type = type;
  }

  add(value: string, { file = null, location, metadata }: CollectableInfos<T>) {
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

  values(): Iterable<string> {
    return this.#entries.keys();
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

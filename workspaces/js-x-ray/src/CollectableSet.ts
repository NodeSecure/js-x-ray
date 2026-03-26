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

export type CollectableSetData<T = Record<string, unknown>> = {
  type: Type;
  entries: Array<{ value: string; locations: Location<T>[]; }>;
};

export interface CollectableSet<T = Record<string, unknown>> {
  add(
    value: string,
    infos: CollectableInfos<T>
  ): void;
  toJSON(): CollectableSetData<T>;
  type: Type;
  values(): Iterable<string>;
}

type Entry<T> = { file: string | null; location: SourceArrayLocation; metadata?: T; };

export class DefaultCollectableSet<
  T = Record<string, unknown>
> implements CollectableSet<T> {
  #entries: Map<string, Entry<T>[]> = new Map();
  type: Type;

  constructor(
    type: Type
  ) {
    this.type = type;
  }

  add(
    value: string,
    { file = null, location, metadata }: CollectableInfos<T>
  ) {
    const entry: Entry<T> = { file, location, ...(metadata && { metadata }) };
    const entries = this.#entries.get(value);

    if (entries) {
      entries.push(entry);
    }
    else {
      this.#entries.set(value, [entry]);
    }
  }

  toJSON(): CollectableSetData<T> {
    return {
      type: this.type,
      entries: [...this]
    };
  }

  static fromJSON<T>(
    data: CollectableSetData<T>
  ): DefaultCollectableSet<T> {
    const set = new DefaultCollectableSet<T>(data.type);

    for (const { value, locations } of data.entries) {
      for (const { file, location, metadata } of locations) {
        for (const loc of location) {
          set.add(value, {
            file,
            location: loc,
            ...(metadata && { metadata })
          });
        }
      }
    }

    return set;
  }

  values(): Iterable<string> {
    return this.#entries.keys();
  }

  * [Symbol.iterator]() {
    for (const [value, entries] of this.#entries) {
      yield {
        value,
        locations: entries.map(({ file, location, metadata }): Location<T> => {
          return {
            file,
            location: [location],
            ...(metadata && { metadata })
          };
        })
      };
    }
  }
}

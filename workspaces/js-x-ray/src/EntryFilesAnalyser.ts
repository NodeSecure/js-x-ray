// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
import combineAsyncIterators from "combine-async-iterators";
import {
  DiGraph,
  type VertexBody,
  type VertexDefinition
} from "digraph-js";

// Import Internal Dependencies
import {
  AstAnalyser,
  type ReportOnFile,
  type RuntimeOptions
} from "./AstAnalyser.ts";
import { TsSourceParser } from "./parsers/TsSourceParser.ts";
import {
  JsSourceParser,
  type SourceParser
} from "./parsers/JsSourceParser.ts";
import { DefaultCollectableSet } from "./CollectableSet.ts";

// CONSTANTS
const kDefaultExtensions = [
  ...Array.from(JsSourceParser.FileExtensions).map((ext) => ext.slice(1)),
  ...Array.from(TsSourceParser.FileExtensions).map((ext) => ext.slice(1)),
  "node"
];

export type ReportOnEntryFile = ReportOnFile & {
  file: string;
};

export interface EntryFilesAnalyserOptions {
  /**
   * An instance of `AstAnalyser` to use for analysing the entry files.
   * If not provided, a default instance will be created with a `DefaultCollectableSet` for "dependency".
   */
  astAnalyzer?: AstAnalyser;
  /**
   * A function that receives the default allowed extensions and
   * returns a new array of extensions to allow when resolving internal dependencies.
   */
  loadExtensions?: (
    defaults: string[]
  ) => string[];
  rootPath?: string | URL;
  /**
   * Whether to ignore ENOENT errors when analysing files.
   * If set to `true`, files that do not exist will be skipped without throwing an error.
   *
   * @default false
   */
  ignoreENOENT?: boolean;
  /**
   * A set of dependencies to ignore when resolving internal dependencies.
   *
   * @default []
   */
  packageDependencies?: Iterable<string>;
}

export interface EntryFilesRuntimeOptions extends RuntimeOptions {
  fileMetadata?: (file: string) => Record<string, unknown>;
}

export class EntryFilesAnalyser {
  static Parsers = {
    js: new JsSourceParser(),
    ts: new TsSourceParser() as unknown as SourceParser
  } as const satisfies Record<string, SourceParser>;

  #rootPath: string | null = null;
  #depPathCache = new Map<string, Promise<string | null>>();
  #packageDependencies: Set<string>;
  astAnalyzer: AstAnalyser;
  allowedExtensions: Set<string>;
  dependencies: DiGraph<VertexDefinition<VertexBody>>;
  ignoreENOENT: boolean;

  constructor(
    options: EntryFilesAnalyserOptions = {}
  ) {
    const {
      astAnalyzer = new AstAnalyser({
        collectables: [
          new DefaultCollectableSet("dependency")
        ]
      }),
      loadExtensions,
      rootPath = null,
      ignoreENOENT = false,
      packageDependencies = []
    } = options;

    this.astAnalyzer = astAnalyzer;
    if (this.astAnalyzer.getCollectableSet("dependency") === void 0) {
      throw new Error("astAnalyzer instance must have a 'dependency' collectable");
    }

    const rawAllowedExtensions = loadExtensions
      ? loadExtensions(kDefaultExtensions)
      : kDefaultExtensions;

    this.allowedExtensions = new Set(rawAllowedExtensions);
    this.#rootPath = rootPath === null ?
      null : fileURLToPathExtended(rootPath);
    this.ignoreENOENT = ignoreENOENT;
    this.#packageDependencies = new Set(packageDependencies);
  }

  async* analyse(
    entryFiles: Iterable<string | URL>,
    options: EntryFilesRuntimeOptions = {}
  ): AsyncGenerator<ReportOnEntryFile> {
    this.dependencies = new DiGraph();
    this.#depPathCache.clear();

    const generators: AsyncGenerator<ReportOnEntryFile>[] = [];
    for (const entryFile of new Set(entryFiles)) {
      const normalizedEntryFile = this.#normalizeAndCleanEntryFile(entryFile);

      if (
        this.ignoreENOENT &&
        !await this.#fileExists(normalizedEntryFile)
      ) {
        continue;
      }

      generators.push(this.#analyseFile(
        normalizedEntryFile,
        this.#getRelativeFilePath(normalizedEntryFile),
        options
      ));
    }

    if (generators.length > 0) {
      yield* combineAsyncIterators(...generators);
    }
  }

  #normalizeAndCleanEntryFile(
    file: string | URL
  ): string {
    let normalizedEntryFile = path.normalize(
      fileURLToPathExtended(file)
    );
    if (this.#rootPath !== null && !path.isAbsolute(normalizedEntryFile)) {
      normalizedEntryFile = path.join(this.#rootPath, normalizedEntryFile);
    }

    return normalizedEntryFile;
  }

  #getRelativeFilePath(
    file: string
  ): string {
    return this.#rootPath ?
      path.relative(this.#rootPath, file) :
      file;
  }

  #getParserFromFileExtension(
    file: string
  ): SourceParser | undefined {
    const fileExtension = path.extname(file);

    if (JsSourceParser.FileExtensions.has(fileExtension)) {
      return EntryFilesAnalyser.Parsers.js;
    }
    else if (TsSourceParser.FileExtensions.has(fileExtension)) {
      return EntryFilesAnalyser.Parsers.ts;
    }

    return void 0;
  }

  async* #analyseFile(
    file: string,
    relativeFile: string,
    options: EntryFilesRuntimeOptions
  ) {
    // Skip declaration files as they are not meant to be analysed
    if (file.includes("d.ts")) {
      return;
    }

    this.dependencies.addVertex({
      id: relativeFile,
      adjacentTo: [],
      body: {}
    });

    const {
      metadata = {},
      fileMetadata = () => {
        return {};
      },
      finalize: userFinalize,
      ...runtimeOptions
    } = options;
    const finalMetadata = Object.assign(
      structuredClone(metadata),
      fileMetadata(file)
    );

    let fileDependencies = new Set<string>();
    const report = await this.astAnalyzer.analyseFile(
      file,
      {
        ...runtimeOptions,
        metadata: finalMetadata,
        customParser: this.#getParserFromFileExtension(file),
        finalize: (sourceFile) => {
          fileDependencies = new Set(sourceFile.dependencies.keys());
          userFinalize?.(sourceFile);
        }
      }
    );
    yield { file: relativeFile, ...report };

    if (!report.ok) {
      return;
    }

    const depFiles = await Promise.all(
      Array.from(fileDependencies)
        .filter((name) => !this.#packageDependencies.has(name))
        .map((name) => this.#getInternalDepPath(path.join(path.dirname(file), name)))
    );

    const generators: AsyncGenerator<ReportOnEntryFile>[] = [];
    for (const depFile of depFiles) {
      if (depFile === null) {
        continue;
      }

      const depRelativeFile = this.#getRelativeFilePath(depFile);
      if (!this.dependencies.hasVertex(depRelativeFile)) {
        this.dependencies.addVertex({
          id: depRelativeFile,
          adjacentTo: [],
          body: {}
        });

        generators.push(this.#analyseFile(depFile, depRelativeFile, options));
      }

      this.dependencies.addEdge({ from: relativeFile, to: depRelativeFile });
    }

    if (generators.length > 0) {
      yield* combineAsyncIterators(...generators);
    }
  }

  #getInternalDepPath(
    filePath: string
  ): Promise<string | null> {
    const cached = this.#depPathCache.get(filePath);
    if (cached !== undefined) {
      return cached;
    }

    const promise = this.#resolveInternalDepPath(filePath);
    this.#depPathCache.set(filePath, promise);

    return promise;
  }

  async #resolveInternalDepPath(
    filePath: string
  ): Promise<string | null> {
    const fileExtension = path.extname(filePath);

    if (fileExtension === "") {
      for (const ext of this.allowedExtensions) {
        const depPathWithExt = `${filePath}.${ext}`;

        const fileExist = await this.#fileExists(depPathWithExt);
        if (fileExist) {
          return depPathWithExt;
        }
      }
    }
    else {
      if (!this.allowedExtensions.has(fileExtension.slice(1))) {
        return null;
      }

      const fileExist = await this.#fileExists(filePath);
      if (fileExist) {
        return filePath;
      }
    }

    return null;
  }

  async #fileExists(
    filePath: string | URL
  ): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);

      return true;
    }
    catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      return false;
    }
  }
}

function fileURLToPathExtended(
  file: string | URL
): string {
  return file instanceof URL ?
    fileURLToPath(file) :
    file;
}

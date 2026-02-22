// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
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

// CONSTANTS
const kDefaultExtensions = [
  ...Array.from(JsSourceParser.FileExtensions).map((ext) => ext.slice(1)),
  ...Array.from(TsSourceParser.FileExtensions).map((ext) => ext.slice(1)),
  "node"
];

export interface EntryFilesAnalyserOptions {
  astAnalyzer?: AstAnalyser;
  loadExtensions?: (defaults: string[]) => string[];
  rootPath?: string | URL;
  ignoreENOENT?: boolean;
}

export class EntryFilesAnalyser {
  static Parsers = {
    js: new JsSourceParser(),
    ts: new TsSourceParser() as unknown as SourceParser
  } as const satisfies Record<string, SourceParser>;

  #rootPath: string | null = null;
  astAnalyzer: AstAnalyser;
  allowedExtensions: Set<string>;
  dependencies: DiGraph<VertexDefinition<VertexBody>>;
  ignoreENOENT: boolean;

  constructor(
    options: EntryFilesAnalyserOptions = {}
  ) {
    const {
      astAnalyzer = new AstAnalyser(),
      loadExtensions,
      rootPath = null,
      ignoreENOENT = false
    } = options;

    this.astAnalyzer = astAnalyzer;
    const rawAllowedExtensions = loadExtensions
      ? loadExtensions(kDefaultExtensions)
      : kDefaultExtensions;

    this.allowedExtensions = new Set(rawAllowedExtensions);
    this.#rootPath = rootPath === null ?
      null : fileURLToPathExtended(rootPath);
    this.ignoreENOENT = ignoreENOENT;
  }

  async* analyse(
    entryFiles: Iterable<string | URL>,
    options: RuntimeOptions = {}
  ): AsyncGenerator<ReportOnFile & { file: string; }> {
    this.dependencies = new DiGraph();

    for (const entryFile of new Set(entryFiles)) {
      const normalizedEntryFile = this.#normalizeAndCleanEntryFile(entryFile);

      if (
        this.ignoreENOENT &&
        !await this.#fileExists(normalizedEntryFile)
      ) {
        return;
      }

      yield* this.#analyseFile(
        normalizedEntryFile,
        this.#getRelativeFilePath(normalizedEntryFile),
        options
      );
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
    options: RuntimeOptions
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

    const report = await this.astAnalyzer.analyseFile(
      file,
      {
        ...options,
        customParser: this.#getParserFromFileExtension(file)
      }
    );
    yield { file: relativeFile, ...report };

    const dependencySet = this.astAnalyzer.getCollectableSet("dependency");

    if (!report.ok || typeof dependencySet === "undefined") {
      return;
    }

    for (const name of dependencySet.values()) {
      const depFile = await this.#getInternalDepPath(
        path.join(path.dirname(file), name)
      );
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

        yield* this.#analyseFile(
          depFile,
          depRelativeFile,
          options
        );
      }

      this.dependencies.addEdge({
        from: relativeFile, to: depRelativeFile
      });
    }
  }

  async #getInternalDepPath(
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

// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
import { DiGraph } from "digraph-js";

// Import Internal Dependencies
import { AstAnalyser } from "./AstAnalyser.js";

// CONSTANTS
const kDefaultExtensions = ["js", "cjs", "mjs", "node"];

export class EntryFilesAnalyser {
  #rootPath = null;

  constructor(options = {}) {
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
    this.#rootPath = options.rootPath === null ?
      null : fileURLToPathExtended(rootPath);
    this.ignoreENOENT = ignoreENOENT;
  }

  async* analyse(
    entryFiles,
    options = {}
  ) {
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

  #normalizeAndCleanEntryFile(file) {
    let normalizedEntryFile = path.normalize(
      fileURLToPathExtended(file)
    );
    if (this.#rootPath !== null && !path.isAbsolute(normalizedEntryFile)) {
      normalizedEntryFile = path.join(this.#rootPath, normalizedEntryFile);
    }

    return normalizedEntryFile;
  }

  #getRelativeFilePath(file) {
    return this.#rootPath ?
      path.relative(this.#rootPath, file) :
      file;
  }

  async* #analyseFile(
    file,
    relativeFile,
    options
  ) {
    this.dependencies.addVertex({
      id: relativeFile,
      adjacentTo: [],
      body: {}
    });

    const report = await this.astAnalyzer.analyseFile(
      file,
      options
    );
    yield { file: relativeFile, ...report };

    if (!report.ok) {
      return;
    }

    for (const [name] of report.dependencies) {
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
    filePath
  ) {
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
    filePath
  ) {
    try {
      await fs.access(filePath, fs.constants.R_OK);

      return true;
    }
    catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      return false;
    }
  }
}

function fileURLToPathExtended(
  file
) {
  return file instanceof URL ?
    fileURLToPath(file) :
    file;
}

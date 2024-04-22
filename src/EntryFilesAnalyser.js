// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";

// Import Internal Dependencies
import { AstAnalyser } from "./AstAnalyser.js";

const kDefaultExtensions = ["js", "cjs", "mjs", "node"];

export class EntryFilesAnalyser {
  /**
   * @constructor
   * @param {object} [options={}]
   * @param {AstAnalyser} [options.astAnalyzer=new AstAnalyser()]
   * @param {function} [options.loadExtensions]
  */
  constructor(options = {}) {
    this.astAnalyzer = options.astAnalyzer ?? new AstAnalyser();
    this.allowedExtensions = options.loadExtensions
      ? options.loadExtensions(kDefaultExtensions)
      : kDefaultExtensions;
  }

  /**
   * Asynchronously analyze a set of entry files yielding analysis reports.
   *
   * @param {(string | URL)[]} entryFiles
   * @yields {Object} - Yields an object containing the analysis report for each file.
  */
  async* analyse(entryFiles) {
    this.analyzedDeps = new Set();

    for (const file of entryFiles) {
      yield* this.#analyzeFile(file);
    }
  }

  async* #analyzeFile(file) {
    const filePath = file instanceof URL ? file.pathname : file;
    const report = await this.astAnalyzer.analyseFile(file);

    yield { url: filePath, ...report };

    if (!report.ok) {
      return;
    }

    yield* this.#analyzeDeps(report.dependencies, path.dirname(filePath));
  }

  async* #analyzeDeps(deps, basePath) {
    for (const [name] of deps) {
      const depPath = await this.#getInternalDepPath(name, basePath);
      if (depPath && !this.analyzedDeps.has(depPath)) {
        this.analyzedDeps.add(depPath);

        yield* this.#analyzeFile(depPath);
      }
    }
  }

  async #getInternalDepPath(name, basePath) {
    const depPath = path.join(basePath, name);
    const existingExt = path.extname(name);
    if (existingExt !== "") {
      if (!this.allowedExtensions.includes(existingExt.slice(1))) {
        return null;
      }

      if (await this.#fileExists(depPath)) {
        return depPath;
      }
    }

    for (const ext of this.allowedExtensions) {
      const depPathWithExt = `${depPath}.${ext}`;
      if (await this.#fileExists(depPathWithExt)) {
        return depPathWithExt;
      }
    }

    return null;
  }

  async #fileExists(path) {
    try {
      await fs.access(path, fs.constants.F_OK);

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

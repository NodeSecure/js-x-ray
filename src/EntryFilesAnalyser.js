// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import { AstAnalyser } from "./AstAnalyser.js";

// CONSTANTS
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
    const rawAllowedExtensions = options.loadExtensions
      ? options.loadExtensions(kDefaultExtensions)
      : kDefaultExtensions;

    this.allowedExtensions = new Set(rawAllowedExtensions);
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
    const filePath = file instanceof URL ? fileURLToPath(file) : file;
    const report = await this.astAnalyzer.analyseFile(file);

    yield { url: filePath, ...report };

    if (!report.ok) {
      return;
    }

    yield* this.#analyzeDeps(
      report.dependencies,
      path.dirname(filePath)
    );
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

    if (existingExt === "") {
      for (const ext of this.allowedExtensions) {
        const depPathWithExt = `${depPath}.${ext}`;

        const fileExist = await this.#fileExists(depPathWithExt);
        if (fileExist) {
          return depPathWithExt;
        }
      }
    }
    else {
      if (!this.allowedExtensions.has(existingExt.slice(1))) {
        return null;
      }

      const fileExist = await this.#fileExists(depPath);
      if (fileExist) {
        return depPath;
      }
    }

    return null;
  }

  async #fileExists(path) {
    try {
      await fs.access(path, fs.constants.R_OK);

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

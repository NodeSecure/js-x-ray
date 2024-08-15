// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import { AstAnalyser } from "./AstAnalyser.js";

// CONSTANTS
const kDefaultExtensions = ["js", "cjs", "mjs", "node"];

export class EntryFilesAnalyser {
  constructor(options = {}) {
    this.astAnalyzer = options.astAnalyzer ?? new AstAnalyser();
    const rawAllowedExtensions = options.loadExtensions
      ? options.loadExtensions(kDefaultExtensions)
      : kDefaultExtensions;

    this.allowedExtensions = new Set(rawAllowedExtensions);
  }

  async* analyse(
    entryFiles,
    analyseFileOptions
  ) {
    this.analyzedDeps = new Set();

    for (const file of entryFiles) {
      yield* this.#analyseFile(file, analyseFileOptions);
    }
  }

  async* #analyseFile(
    file,
    options
  ) {
    const filePath = file instanceof URL ? fileURLToPath(file) : file;
    const report = await this.astAnalyzer.analyseFile(file, options);

    yield { url: filePath, ...report };

    if (!report.ok) {
      return;
    }

    for (const [name] of report.dependencies) {
      const depPath = await this.#getInternalDepPath(
        name,
        path.dirname(filePath)
      );

      if (depPath && !this.analyzedDeps.has(depPath)) {
        this.analyzedDeps.add(depPath);

        yield* this.#analyseFile(depPath, options);
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

// Import Node.js Dependencies
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { JsSourceParser, type SourceParser } from "./JsSourceParser.ts";
import * as trojan from "./obfuscators/trojan-source.ts";
import {
  PipelineRunner,
  type Pipeline
} from "./pipelines/index.ts";
import { ProbeRunner, type Probe } from "./ProbeRunner.ts";
import {
  SourceFile,
  type SourceFlags
} from "./SourceFile.ts";
import {
  isMinifiedCode,
  isOneLineExpressionExport
} from "./utils/index.ts";
import { walkEnter } from "./walker/index.ts";
import {
  generateWarning,
  type OptionalWarningName,
  type Warning
} from "./warnings.ts";
import { CollectableSet } from "./CollectableSet.ts";
import { CollectableSetRegistry } from "./CollectableSetRegistry.ts";

export interface Dependency {
  unsafe: boolean;
  inTry: boolean;
  location?: null | ESTree.SourceLocation;
}

export interface RuntimeOptions {
  /**
   * A filesystem location for the given source code.
   */
  location?: string;
  /**
   * @default false
   */
  removeHTMLComments?: boolean;
  /**
   * @default false
   */
  isMinified?: boolean;
  initialize?: (sourceFile: SourceFile) => void;
  finalize?: (sourceFile: SourceFile) => void;
  /**
   * @default JsSourceParser
   */
  customParser?: SourceParser;
  metadata?: Record<string, unknown>;
}

export interface RuntimeFileOptions extends Omit<RuntimeOptions, "isMinified"> {
  packageName?: string;
}

export interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  flags: Set<SourceFlags>;
  idsLengthAvg: number;
  stringScore: number;
}

export type ReportOnFile = {
  ok: true;
  warnings: Warning[];
  dependencies: Map<string, Dependency>;
  flags: Set<SourceFlags>;
} | {
  ok: false;
  warnings: Warning[];
};

export type Sensitivity = "conservative" | "aggressive";

export interface AstAnalyserOptions {
  /**
   * @default []
   */
  customProbes?: Probe[];
  /**
   * @default false
   */
  skipDefaultProbes?: boolean;
  /**
   * @default false
   */
  optionalWarnings?: boolean | Iterable<OptionalWarningName>;
  pipelines?: Pipeline[];
  /**
   * @default []
   */
  collectables?: CollectableSet[];
  /**
   * Configures the sensitivity level for warning detection.
   *
   * - `conservative` (default): Strict detection to minimize false positives.
   *   Suitable for scanning ecosystem libraries.
   * - `aggressive`: Relaxed constraints to surface more warnings.
   *   Provides maximum visibility for local project security auditing.
   *
   * @default "conservative"
   */
  sensitivity?: Sensitivity;
}

export interface PrepareSourceOptions {
  removeHTMLComments?: boolean;
}

export class AstAnalyser {
  static DefaultParser: SourceParser = new JsSourceParser();

  #pipelineRunner: PipelineRunner;
  probes: Probe[];
  #collectables: CollectableSet[];
  #sensitivity: Sensitivity;

  constructor(options: AstAnalyserOptions = {}) {
    const {
      customProbes = [],
      optionalWarnings = false,
      skipDefaultProbes = false,
      pipelines = [],
      collectables = [],
      sensitivity = "conservative"
    } = options;

    this.#pipelineRunner = new PipelineRunner(pipelines);
    this.#collectables = collectables;
    this.#sensitivity = sensitivity;

    let probes = ProbeRunner.Defaults;
    if (
      Array.isArray(customProbes) &&
      customProbes.length > 0
    ) {
      probes = skipDefaultProbes === true ?
        customProbes :
        [...probes, ...customProbes];
    }

    if (typeof optionalWarnings === "boolean") {
      if (optionalWarnings) {
        probes = [...probes, ...Object.values(ProbeRunner.Optionals)];
      }
    }
    else {
      const optionalProbes = Array.from(optionalWarnings ?? [])
        .flatMap((warning) => ProbeRunner.Optionals[warning] ?? []);

      probes = [...probes, ...optionalProbes];
    }

    this.probes = probes;
  }

  analyse(
    str: string,
    options: RuntimeOptions = {}
  ): Report {
    const {
      location,
      isMinified = false,
      removeHTMLComments = false,
      initialize,
      finalize,
      metadata
    } = options;

    const parser = options.customParser ?? AstAnalyser.DefaultParser;

    const body = parser.parse(
      this.prepareSource(str, { removeHTMLComments }),
      void 0
    );

    const source = new SourceFile(location, metadata);
    source.sensitivity = this.#sensitivity;
    if (trojan.verify(str)) {
      source.warnings.push(
        generateWarning("obfuscated-code", { value: "trojan-source" })
      );
    }

    const probeRunner = new ProbeRunner(source, new CollectableSetRegistry(this.#collectables), this.probes);
    if (initialize) {
      if (typeof initialize !== "function") {
        throw new TypeError("options.initialize must be a function");
      }
      initialize(source);
    }

    // we walk each AST Nodes, this is a purely synchronous I/O
    const reducedBody = this.#pipelineRunner.reduce(body);
    walkEnter(reducedBody, function walk(node) {
      // Skip the root of the AST.
      if (Array.isArray(node)) {
        return;
      }

      source.walk(node);
      const action = probeRunner.walk(node);
      if (action === "skip") {
        this.skip();
      }
    });

    if (finalize) {
      if (typeof finalize !== "function") {
        throw new TypeError("options.finalize must be a function");
      }
      finalize(source);
    }
    probeRunner.finalize();

    // Add oneline-require flag if this is a one-line require expression
    if (isOneLineExpressionExport(body)) {
      source.flags.add("oneline-require");
    }

    return {
      ...source.getResult(isMinified),
      dependencies: source.dependencies,
      flags: source.flags
    };
  }

  async analyseFile(
    pathToFile: string | URL,
    options: RuntimeFileOptions = {}
  ): Promise<ReportOnFile> {
    try {
      const {
        packageName = null,
        removeHTMLComments = false,
        initialize,
        finalize,
        customParser
      } = options;

      const str = await fs.readFile(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinifiedCode(str);
      const data = this.analyse(str, {
        location: path.dirname(filePathString),
        isMinified: isMin,
        removeHTMLComments,
        initialize,
        finalize,
        customParser
      });

      if (packageName !== null) {
        data.dependencies.delete(packageName);
      }

      // Add is-minified flag if the file is minified and not a one-line require
      if (!data.flags.has("oneline-require") && isMin) {
        data.flags.add("is-minified");
      }

      return {
        ok: true,
        dependencies: data.dependencies,
        warnings: data.warnings,
        flags: data.flags
      };
    }
    catch (error: any) {
      return {
        ok: false,
        warnings: [
          generateWarning("parsing-error", {
            value: error.message
          })
        ]
      };
    }
  }

  analyseFileSync(
    pathToFile: string | URL,
    options: RuntimeFileOptions = {}
  ): ReportOnFile {
    try {
      const {
        packageName = null,
        removeHTMLComments = false,
        initialize,
        finalize,
        customParser
      } = options;

      const str = fsSync.readFileSync(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinifiedCode(str);
      const data = this.analyse(str, {
        location: path.dirname(filePathString),
        isMinified: isMin,
        removeHTMLComments,
        initialize,
        finalize,
        customParser
      });

      if (packageName !== null) {
        data.dependencies.delete(packageName);
      }

      // Add is-minified flag if the file is minified and not a one-line require
      if (!data.flags.has("oneline-require") && isMin) {
        data.flags.add("is-minified");
      }

      return {
        ok: true,
        dependencies: data.dependencies,
        warnings: data.warnings,
        flags: data.flags
      };
    }
    catch (error: any) {
      return {
        ok: false,
        warnings: [
          generateWarning("parsing-error", {
            value: error.message
          })
        ]
      };
    }
  }

  prepareSource(
    source: string,
    options: PrepareSourceOptions = {}
  ): string {
    if (typeof source !== "string") {
      throw new TypeError("source must be a string");
    }
    const { removeHTMLComments = false } = options;

    /**
     * if the file start with a shebang then we remove it because meriyah.parseScript fail to parse it.
     * @example
     * #!/usr/bin/env node
     */
    const rawNoShebang = source.startsWith("#") ?
      source.slice(source.indexOf("\n") + 1) : source;

    return removeHTMLComments ?
      this.#removeHTMLComment(rawNoShebang) : rawNoShebang;
  }

  #removeHTMLComment(str: string): string {
    return str.replaceAll(/<!--[\s\S]*?(?:-->)/g, "");
  }
}

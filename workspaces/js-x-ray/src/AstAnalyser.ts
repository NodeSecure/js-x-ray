// Import Node.js Dependencies
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  generateWarning,
  type Warning,
  type OptionalWarningName
} from "./warnings.js";
import {
  SourceFile,
  type SourceFlags
} from "./SourceFile.js";
import { JsSourceParser, type SourceParser } from "./JsSourceParser.js";
import { ProbeRunner, type Probe } from "./ProbeRunner.js";
import { walkEnter } from "./walker/index.js";
import * as trojan from "./obfuscators/trojan-source.js";
import {
  isOneLineExpressionExport,
  isMinifiedCode
} from "./utils/index.js";
import {
  PipelineRunner,
  type Pipeline
} from "./pipelines/index.js";

export interface Dependency {
  unsafe: boolean;
  inTry: boolean;
  location?: null | ESTree.SourceLocation;
}

export interface RuntimeOptions {
  /**
   * @default true
   */
  module?: boolean;
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

export interface AstAnalyserOptions {
  /**
   * @default JsSourceParser
   */
  customParser?: SourceParser;
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
}

export interface PrepareSourceOptions {
  removeHTMLComments?: boolean;
}

export class AstAnalyser {
  #pipelineRunner: PipelineRunner;
  parser: SourceParser;
  probes: Probe[];

  constructor(options: AstAnalyserOptions = {}) {
    const {
      customProbes = [],
      optionalWarnings = false,
      skipDefaultProbes = false,
      pipelines = []
    } = options;

    this.#pipelineRunner = new PipelineRunner(pipelines);
    this.parser = options.customParser ?? new JsSourceParser();

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
      isMinified = false,
      module = true,
      removeHTMLComments = false,
      initialize,
      finalize
    } = options;

    const body = this.parser.parse(this.prepareSource(str, { removeHTMLComments }), {
      isEcmaScriptModule: Boolean(module)
    });

    const source = new SourceFile();
    if (trojan.verify(str)) {
      source.warnings.push(
        generateWarning("obfuscated-code", { value: "trojan-source" })
      );
    }

    const probeRunner = new ProbeRunner(source, this.probes);
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
        module = true,
        removeHTMLComments = false,
        initialize,
        finalize
      } = options;

      const str = await fs.readFile(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinifiedCode(str);
      const data = this.analyse(str, {
        isMinified: isMin,
        module: path.extname(filePathString) === ".mjs" ? true : module,
        removeHTMLComments,
        initialize,
        finalize
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
        module = true,
        removeHTMLComments = false,
        initialize,
        finalize
      } = options;

      const str = fsSync.readFileSync(pathToFile, "utf-8");
      const filePathString = pathToFile instanceof URL ? pathToFile.href : pathToFile;

      const isMin = filePathString.includes(".min") || isMinifiedCode(str);
      const data = this.analyse(str, {
        isMinified: isMin,
        module: path.extname(filePathString) === ".mjs" ? true : module,
        removeHTMLComments,
        initialize,
        finalize
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

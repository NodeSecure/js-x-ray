// Import Node.js Dependencies
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  JsSourceParser,
  type SourceParser
} from "./parsers/JsSourceParser.ts";
import {
  TsSourceParser
} from "./parsers/TsSourceParser.ts";
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
import { getCallExpressionIdentifier } from "./estree/index.ts";
import {
  generateWarning,
  type OptionalWarningName,
  type Warning
} from "./warnings.ts";
import type { CollectableSet, Type } from "./CollectableSet.ts";
import { CollectableSetRegistry } from "./CollectableSetRegistry.ts";

export type Dependency = {
  unsafe: boolean;
  inTry: boolean;
};

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
  packageName?: string;
}

export interface Report {
  warnings: Warning[];
  flags: Set<SourceFlags>;
  idsLengthAvg: number;
  stringScore: number;
}

export type ReportOnFile = {
  ok: true;
  warnings: Warning[];
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
  #collectableSetRegistry: CollectableSetRegistry;

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
      packageName,
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

    const source = new SourceFile(location, {
      metadata,
      collectables: this.#collectables,
      packageName
    });

    this.#collectableSetRegistry = source.collectablesSetRegistry;

    source.sensitivity = this.#sensitivity;
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
    this.#walkEnter(reducedBody, probeRunner);

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
      flags: source.flags
    };
  }

  #walkEnter(body: ESTree.Statement[], probeRunner: ProbeRunner) {
    const recur = this.#walkEnter.bind(this);
    walkEnter(body, function walk(node) {
      if (Array.isArray(node)) {
        return;
      }

      for (const probeNode of probeRunner.sourceFile.walk(node)) {
        const action = probeRunner.walk(probeNode);
        if (action === "skip") {
          this.skip();
        }
        if (probeNode.type === "CallExpression" && getCallExpressionIdentifier(probeNode, {
          resolveCallExpression: true
        }) === "eval" && probeNode.arguments[0].type === "Literal" && typeof probeNode.arguments[0].value === "string") {
          const evalBody = AstAnalyser.DefaultParser.parse(probeNode.arguments[0].value, void 0);
          recur(evalBody, probeRunner);
        }
      }
    });
  }

  async analyseFile(
    pathToFile: string | URL,
    options: RuntimeOptions = {}
  ): Promise<ReportOnFile> {
    const filePathString = pathToFile instanceof URL ?
      pathToFile.href :
      pathToFile;

    if (filePathString.includes("d.ts")) {
      throw new Error("Declaration files are not supported");
    }

    try {
      const {
        packageName,
        removeHTMLComments = false,
        initialize,
        finalize,
        customParser,
        metadata
      } = options;

      let customParserToUse = customParser;
      if (!customParser && path.extname(filePathString) === ".ts") {
        customParserToUse = new TsSourceParser();
      }

      const str = await fs.readFile(pathToFile, "utf-8");
      const isMin = filePathString.includes(".min") || isMinifiedCode(str);
      const data = this.analyse(str, {
        location: path.dirname(filePathString),
        isMinified: isMin,
        removeHTMLComments,
        initialize,
        finalize,
        customParser: customParserToUse,
        metadata,
        packageName
      });

      // Add is-minified flag if the file is minified and not a one-line require
      if (!data.flags.has("oneline-require") && isMin) {
        data.flags.add("is-minified");
      }

      return {
        ok: true,
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
    options: RuntimeOptions = {}
  ): ReportOnFile {
    const filePathString = pathToFile instanceof URL ?
      pathToFile.href :
      pathToFile;

    if (filePathString.includes("d.ts")) {
      throw new Error("Declaration files are not supported");
    }

    try {
      const {
        packageName,
        removeHTMLComments = false,
        initialize,
        finalize,
        customParser,
        metadata
      } = options;

      let customParserToUse = customParser;
      if (!customParser && path.extname(filePathString) === ".ts") {
        customParserToUse = new TsSourceParser();
      }

      const str = fsSync.readFileSync(pathToFile, "utf-8");
      const isMin = filePathString.includes(".min") || isMinifiedCode(str);
      const data = this.analyse(str, {
        location: path.dirname(filePathString),
        isMinified: isMin,
        removeHTMLComments,
        initialize,
        finalize,
        customParser: customParserToUse,
        metadata,
        packageName
      });

      // Add is-minified flag if the file is minified and not a one-line require
      if (!data.flags.has("oneline-require") && isMin) {
        data.flags.add("is-minified");
      }

      return {
        ok: true,
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

  getCollectableSet(type: Type) {
    return this.#collectableSetRegistry.get(type);
  }
}

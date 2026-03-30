// Import Node.js Dependencies
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { EventEmitter } from "node:events";
import { performance } from "node:perf_hooks";

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
import { getCallExpressionIdentifier, isLiteral } from "./estree/index.ts";
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
  /**
   * The execution time of the analysis in milliseconds.
   */
  executionTime: number;
}

export type ReportOnFile = {
  ok: true;
  warnings: Warning[];
  flags: Set<SourceFlags>;
  /**
   * The execution time of the analysis in milliseconds.
   */
  executionTime: number;
} | {
  ok: false;
  warnings: Warning[];
  /**
   * The execution time of the analysis in milliseconds.
   */
  executionTime: number;
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

export type AstAnalyserEvents = {
  [AstAnalyser.ParsingError]: [
    {
      error: Error;
      file: string;
    }
  ];
};

export class AstAnalyser extends EventEmitter<AstAnalyserEvents> {
  static ParsingError = Symbol("ParsingError");
  static DefaultParser: SourceParser = new JsSourceParser();

  #pipelineRunner: PipelineRunner;
  probes: Probe[];
  #sensitivity: Sensitivity;
  #collectableSetRegistry: CollectableSetRegistry | undefined;

  constructor(
    options: AstAnalyserOptions = {}
  ) {
    super();
    const {
      customProbes = [],
      optionalWarnings = false,
      skipDefaultProbes = false,
      pipelines = [],
      collectables = [],
      sensitivity = "conservative"
    } = options;

    this.#pipelineRunner = new PipelineRunner(pipelines);
    this.#collectableSetRegistry = new CollectableSetRegistry(
      collectables ?? []
    );
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
    const startTime = performance.now();

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
      packageName,
      collectableRegistry: this.#collectableSetRegistry
    });

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

    const executionTime = performance.now() - startTime;

    return {
      ...source.getResult(isMinified),
      flags: source.flags,
      executionTime
    };
  }

  #walkEnter(
    body: ESTree.Statement[],
    probeRunner: ProbeRunner
  ) {
    const recursiveWalkEnter = this.#walkEnter.bind(this);
    walkEnter(body, function walk(node) {
      if (Array.isArray(node)) {
        return;
      }

      probeRunner.sourceFile.walk(
        node,
        (probeNode) => {
          const action = probeRunner.walk(probeNode);
          if (action === "skip") {
            this.skip();
          }

          if (
            isEvalCallExpr(probeNode) &&
            isLiteral(probeNode.arguments[0])
          ) {
            const evalBody = AstAnalyser.DefaultParser.parse(
              probeNode.arguments[0].value,
              void 0
            );
            recursiveWalkEnter(evalBody, probeRunner);
          }
        }
      );
    });
  }

  async analyseFile(
    pathToFile: string | URL,
    options: RuntimeOptions = {}
  ): Promise<ReportOnFile> {
    const startTime = performance.now();

    const filePathString = pathToFile instanceof URL ?
      pathToFile.href :
      pathToFile;

    if (filePathString.includes("d.ts")) {
      throw new Error("Declaration files are not supported");
    }

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
    const location = path.dirname(filePathString);

    try {
      const data = this.analyse(str, {
        location,
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

      const executionTime = performance.now() - startTime;

      return {
        ok: true,
        warnings: data.warnings,
        flags: data.flags,
        executionTime
      };
    }
    catch (error: any) {
      this.emit(AstAnalyser.ParsingError, {
        error,
        file: filePathString
      });

      const executionTime = performance.now() - startTime;

      return {
        ok: false,
        warnings: [
          generateWarning("parsing-error", {
            value: error.message
          })
        ],
        executionTime
      };
    }
  }

  analyseFileSync(
    pathToFile: string | URL,
    options: RuntimeOptions = {}
  ): ReportOnFile {
    const startTime = performance.now();

    const filePathString = pathToFile instanceof URL ?
      pathToFile.href :
      pathToFile;

    if (filePathString.includes("d.ts")) {
      throw new Error("Declaration files are not supported");
    }

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
    const location = path.dirname(filePathString);

    try {
      const data = this.analyse(str, {
        location,
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

      const executionTime = performance.now() - startTime;

      return {
        ok: true,
        warnings: data.warnings,
        flags: data.flags,
        executionTime
      };
    }
    catch (error: any) {
      this.emit(AstAnalyser.ParsingError, {
        error,
        file: filePathString
      });

      const executionTime = performance.now() - startTime;

      return {
        ok: false,
        warnings: [
          generateWarning("parsing-error", {
            value: error.message
          })
        ],
        executionTime
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

  getCollectableSet(
    type: Type
  ) {
    return this.#collectableSetRegistry?.get(type);
  }
}

function isEvalCallExpr(
  node: ESTree.Node
): node is ESTree.CallExpression {
  return (
    node.type === "CallExpression" &&
    getCallExpressionIdentifier(node, { resolveCallExpression: true }) === "eval"
  );
}

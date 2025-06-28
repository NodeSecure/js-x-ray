// Third-party
import type { DiGraph, VertexDefinition, VertexBody } from "digraph-js";
import { Statement } from "meriyah";

// Internal
import {
  Warning,
  WarningName
} from "./warnings.js";

export {
  AstAnalyser,
  AstAnalyserOptions,

  EntryFilesAnalyser,
  EntryFilesAnalyserOptions,

  JsSourceParser,
  SourceParser,

  RuntimeOptions,
  RuntimeFileOptions,

  Report,
  ReportOnFile,

  SourceFlags,
  SourceLocation,
  Dependency
}

type SourceFlags =
  | "fetch"
  | "oneline-require"
  | "is-minified";

interface SourceLocation {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  }
}

interface Dependency {
  unsafe: boolean;
  inTry: boolean;
  location?: null | SourceLocation;
}

interface RuntimeOptions {
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

interface RuntimeFileOptions extends Omit<RuntimeOptions, "isMinified"> {
  packageName?: string;
}

interface AstAnalyserOptions {
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
  optionalWarnings?: boolean | Iterable<string>;
}

interface Probe {
  validateNode: Function | Function[];
  main: Function;
}

interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  flags: Set<SourceFlags>;
  idsLengthAvg: number;
  stringScore: number;
}

type ReportOnFile = {
  ok: true,
  warnings: Warning[];
  dependencies: Map<string, Dependency>;
  flags: Set<SourceFlags>;
} | {
  ok: false,
  warnings: Warning[];
}

interface SourceParser {
  parse(source: string, options: unknown): Statement[];
}

declare class AstAnalyser {
  constructor(options?: AstAnalyserOptions);
  analyse: (
    str: string,
    options?: RuntimeOptions
  ) => Report;
  analyseFile(
    pathToFile: string,
    options?: RuntimeFileOptions
  ): Promise<ReportOnFile>;
  analyseFileSync(
    pathToFile: string,
    options?: RuntimeFileOptions
  ): ReportOnFile;
}

declare class SourceFile {
  flags: Set<SourceFlags>;

  constructor(source: string, options: any);
  addDependency(
    name: string,
    location?: string | null,
    unsafe?: boolean
  ): void;
  addWarning(
    name: WarningName,
    value: string,
    location?: any
  ): void;
  analyzeLiteral(node: any, inArrayExpr?: boolean): void;
  getResult(isMinified: boolean): any;
  walk(node: any): "skip" | null;
}

interface EntryFilesAnalyserOptions {
  astAnalyzer?: AstAnalyser;
  loadExtensions?: (defaults: string[]) => string[];
  rootPath?: string | URL;
  ignoreENOENT?: boolean;
}

declare class EntryFilesAnalyser {
  public astAnalyzer: AstAnalyser;
  public allowedExtensions: Set<string>;
  public dependencies: DiGraph<VertexDefinition<VertexBody>>;

  constructor(options?: EntryFilesAnalyserOptions);

  /**
   * Asynchronously analyze a set of entry files yielding analysis reports.
   */
  analyse(
    entryFiles: Iterable<string | URL>,
    options?: RuntimeFileOptions
  ): AsyncGenerator<ReportOnFile & { file: string }>;
}

declare class JsSourceParser implements SourceParser {
  parse(source: string, options: unknown): Statement[];
}

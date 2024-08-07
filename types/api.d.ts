import {
  Warning,
  WarningName
} from "./warnings.js";
import { Statement } from "meriyah";

export {
  AstAnalyser,
  AstAnalyserOptions,

  EntryFilesAnalyser,
  EntryFilesAnalyserOptions,

  JsSourceParser,
  SourceParser,
  runASTAnalysis,
  runASTAnalysisOnFile,

  RuntimeOptions,
  RuntimeFileOptions,

  Report,
  ReportOnFile,

  SourceLocation,
  Dependency
}

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
}

interface Probe {
  validateNode: Function | Function[];
  main: Function;
}

interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  idsLengthAvg: number;
  stringScore: number;
  isOneLineRequire: boolean;
}

type ReportOnFile = {
  ok: true,
  warnings: Warning[];
  dependencies: Map<string, Dependency>;
  isMinified: boolean;
} | {
  ok: false,
  warnings: Warning[];
}

interface SourceParser {
  parse(source: string, options: unknown): Statement[];
}

declare class AstAnalyser {
  constructor(options?: AstAnalyserOptions);
  analyse: (str: string, options?: RuntimeOptions) => Report;
  analyseFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;
}

interface EntryFilesAnalyserOptions {
  astAnalyzer?: AstAnalyser;
  loadExtensions?: (defaults: string[]) => string[];
}

declare class SourceFile {
  constructor(source: string, options: any);
  addDependency(name: string, location?: string | null, unsafe?: boolean): void;
  addWarning(name: WarningName, value: string, location?: any): void;
  analyzeLiteral(node: any, inArrayExpr?: boolean): void;
  getResult(isMinified: boolean): any;
  walk(node: any): "skip" | null;
}

declare class EntryFilesAnalyser {
  constructor(options?: EntryFilesAnalyserOptions);

  /**
   * Asynchronously analyze a set of entry files yielding analysis reports.
   */
  analyse(entryFiles: (string | URL)[]): AsyncGenerator<ReportOnFile & { url: string }>;
}

declare class JsSourceParser implements SourceParser {
  parse(source: string, options: unknown): Statement[];
}

declare function runASTAnalysis(str: string, options?: RuntimeOptions & AstAnalyserOptions): Report;
declare function runASTAnalysisOnFile(pathToFile: string, options?: RuntimeFileOptions & AstAnalyserOptions): Promise<ReportOnFile>;

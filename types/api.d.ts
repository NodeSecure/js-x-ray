import { Warning } from "./warnings.js";
import { Statement } from "meriyah/dist/src/estree.js";

export {
  AstAnalyser,
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

interface RuntimeCommonOptions {
  /**
   * @default true
   */
  module?: boolean;
  /**
   * @default false
   */
  removeHTMLComments?: boolean;
}

interface RuntimeDefaultOptions extends RuntimeCommonOptions {
  /**
   * @default false
   */
  isMinified?: boolean;
}

interface RuntimeFileOptions extends RuntimeCommonOptions {
  packageName?: string;
}

interface RuntimeAnalyzerOptions {
  /**
   * @default JsSourceParser
   */
  customParser?: SourceParser;
  /**
   * @default []
   */
  customProbe?: Probe[] | null;
  /**
   * @default false
   */
  isReplacing?: boolean;
}

type RuntimeOptions = RuntimeAnalyzerOptions & (RuntimeDefaultOptions | RuntimeFileOptions);


interface Probe {
  validate: Function[] | Function;
  main: Function[] | Function;
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
  constructor(options?: RuntimeOptions);
  analyse: (str: string, options?: RuntimeDefaultOptions) => Report;
  analyzeFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;
}

declare function runASTAnalysis(str: string, options?: RuntimeOptions): Report;
declare function runASTAnalysisOnFile(pathToFile: string, options?: RuntimeOptions): Promise<ReportOnFile>;

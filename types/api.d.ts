import { Warning } from "./warnings.js";

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

interface RuntimeOptions {
  /**
   * @default true
   */
  module?: boolean;
  /**
   * @default false
   */
  isMinified?: boolean;
  /**
   * @default false
   */
  removeHTMLComments?: boolean;
  
  customParser?: SourceParser;
}

interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  idsLengthAvg: number;
  stringScore: number;
  isOneLineRequire: boolean;
}

interface RuntimeFileOptions extends Omit<RuntimeOptions, "isMinified"> {
  packageName?: string;
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
  parse(source: string, options: unknown): ESTree.Program;
}

interface AstAnalyser {
  constructor(parser: SourceParser): void;
  analyse: (str: string, options?: Omit<RuntimeOptions, "customParser">) => Report;
  analyzeFile(pathToFile: string, options?: Omit<RuntimeFileOptions, "customParser">): Promise<ReportOnFile>;
}

declare function runASTAnalysis(str: string, options?: RuntimeOptions): Report;
declare function runASTAnalysisOnFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;

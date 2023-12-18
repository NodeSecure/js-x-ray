import { Warning } from "./warnings.js";

export {
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
}

interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  idsLengthAvg: number;
  stringScore: number;
  isOneLineRequire: boolean;
}

interface RuntimeFileOptions {
  packageName?: string;
  /**
   * @default true
   */
  module?: boolean;
  /**
   * @default false
   */
  removeHTMLComments?: boolean;
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

declare function runASTAnalysis(str: string, options?: RuntimeOptions): Report;
declare function runASTAnalysisOnFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;

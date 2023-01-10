import { ASTDeps } from "./astdeps.js";
import { Warning } from "./warnings.js";

export {
  runASTAnalysis,
  runASTAnalysisOnFile,

  RuntimeOptions,
  RuntimeFileOptions,

  Report,
  ReportOnFile
}

interface RuntimeOptions {
  module?: boolean;
  isMinified?: boolean;
}

interface Report {
  dependencies: ASTDeps;
  warnings: Warning[];
  idsLengthAvg: number;
  stringScore: number;
  isOneLineRequire: boolean;
}

interface RuntimeFileOptions {
  packageName?: string;
  module?: boolean;
}

type ReportOnFile = {
  ok: true,
  warnings: Warning[];
  dependencies: ASTDeps;
  isMinified: boolean;
} | {
  ok: false,
  warnings: Warning[];
}

declare function runASTAnalysis(str: string, options?: RuntimeOptions): Report;
declare function runASTAnalysisOnFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;

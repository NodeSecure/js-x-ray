import { Warning } from "./warnings.js";
import { Statement } from "meriyah/dist/src/estree.js";
import {validateFunctionName} from "meriyah/dist/src/common";

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

interface RootOptions {
  /**
   * @default ASTOptions
   */
  ASTOptions?: ASTOptions;
  /**
   * @default RuntimeOptions
   */
  RuntimeOptions?: RuntimeOptions;
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

interface ASTOptions {
  /**
   * @default false
   */
  isReplacing?: boolean;
  /**
   * @default []
   */
  customParser?: Probe[] | null;
}

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
  parse(source: string, options: unknown): Statement[];
}

declare class AstAnalyser {
  constructor(parser?: SourceParser, astOptions?: ASTOptions);
  analyse: (str: string, options?: Omit<RuntimeOptions, "customParser">) => Report;
  analyzeFile(pathToFile: string, options?: Omit<RuntimeFileOptions, "customParser">): Promise<ReportOnFile>;
}

declare function runASTAnalysis(str: string, options?: RootOptions): Report;
declare function runASTAnalysisOnFile(pathToFile: string, options?: RootOptions): Promise<ReportOnFile>;

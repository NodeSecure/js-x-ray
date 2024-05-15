import {
  AstAnalyser,
  AstAnalyserOptions,

  EntryFilesAnalyser,
  EntryFilesAnalyserOptions,

  SourceParser,
  JsSourceParser,
  runASTAnalysis,
  runASTAnalysisOnFile,
  Report,
  ReportOnFile,
  RuntimeFileOptions,
  RuntimeOptions,
  SourceLocation,
  Dependency
} from "./types/api.js";
import {
  Warning,
  WarningDefault,
  WarningLocation,
  WarningName,
  WarningNameWithValue
} from "./types/warnings.js";

declare const warnings: Record<WarningName, Pick<WarningDefault, "experimental" | "i18n" | "severity">>;

export {
  warnings,
  AstAnalyser,
  AstAnalyserOptions,
  EntryFilesAnalyser,
  EntryFilesAnalyserOptions,
  JsSourceParser,
  SourceParser,
  runASTAnalysis,
  runASTAnalysisOnFile,
  Report,
  ReportOnFile,
  RuntimeFileOptions,
  RuntimeOptions,
  SourceLocation,
  Dependency,
  Warning,
  WarningDefault,
  WarningLocation,
  WarningName,
  WarningNameWithValue
}

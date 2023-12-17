import {
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

import {
  runASTAnalysis,
  runASTAnalysisOnFile,
  Report,
  ReportOnFile,
  RuntimeFileOptions,
  RuntimeOptions
} from "./types/api.js";
import {
  Warning,
  WarningDefault,
  WarningLocation,
  WarningName,
  WarningNameWithValue
} from "./types/warnings.js";
import { ASTDeps, Dependency } from "./types/astdeps.js";

declare const warnings: Record<WarningName, Pick<WarningDefault, "experimental" | "i18n" | "severity">>;

export {
  warnings,
  runASTAnalysis,
  runASTAnalysisOnFile,
  Report,
  ReportOnFile,
  RuntimeFileOptions,
  RuntimeOptions,
  ASTDeps,
  Dependency,
  Warning,
  WarningDefault,
  WarningLocation,
  WarningName,
  WarningNameWithValue
}

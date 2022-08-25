import {
  runASTAnalysis,
  runASTAnalysisOnFile,
  Report,
  ReportOnFile,
  RuntimeFileOptions,
  RuntimeOptions
} from "./types/api";
import {
  Warning,
  WarningDefault,
  WarningLocation,
  WarningName,
  WarningNameWithValue
} from "./types/warnings";
import { ASTDeps, Dependency } from "./types/astdeps";

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

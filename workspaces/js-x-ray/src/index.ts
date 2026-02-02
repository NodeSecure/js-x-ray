// Import Node.js Dependencies
import path from "node:path";

export * from "./AstAnalyser.ts";
export * from "./EntryFilesAnalyser.ts";
export * from "./JsSourceParser.ts";
export {
  Pipelines,
  type Pipeline
} from "./pipelines/index.ts";
export * from "./SourceFile.ts";
export * from "./warnings.ts";
export * from "./CollectableSet.ts";
export * from "./contants.ts";
export {
  VariableTracer,
  type SourceTraced,
  type DataIdentifierOptions,
  type TracedIdentifierReport
} from "./VariableTracer.ts";

export function i18nLocation() {
  return path.join(import.meta.dirname, "i18n");
}

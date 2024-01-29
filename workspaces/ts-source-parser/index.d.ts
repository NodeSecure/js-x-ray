import { tsParsingOptions } from "./src/TsSourceParser";

declare class TsSourceParser {
  parse(
    code: string,
    options = tsParsingOptions,
  ): TSESTree.Program;
}

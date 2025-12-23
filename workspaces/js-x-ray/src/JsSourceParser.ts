// Import Third-party Dependencies
import {
  parseModule,
  parse,
  type ESTree,
  type Options
} from "meriyah";

// CONSTANTS
const kParsingOptions: Partial<Options> = {
  next: true,
  loc: true,
  raw: true,
  jsx: true
};

export type SourceParserSyntaxError = SyntaxError & {
  start: number;
  end: number;
  range: [number, number];
  description: string;
  loc: ESTree.SourceLocation;
};

export interface SourceParser {
  parse(source: string, options: unknown): ESTree.Statement[];
}

export class JsSourceParser implements SourceParser {
  static FileExtensions = new Set([
    ".js",
    ".cjs",
    ".mjs",
    ".jsx"
  ]);

  parse(
    source: string
  ): ESTree.Program["body"] {
    try {
      const { body } = parseModule(
        source,
        structuredClone(kParsingOptions)
      );

      return body;
    }
    catch (error: unknown) {
      const syntaxError = error as SourceParserSyntaxError;
      const isIllegalReturn = syntaxError.description.includes("Illegal return statement");

      if (isIllegalReturn) {
        const { body } = parse(
          source,
          {
            ...structuredClone(kParsingOptions),
            sourceType: "commonjs"
          }
        );

        return body;
      }

      throw error;
    }
  }
}

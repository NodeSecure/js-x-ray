// Import Third-party Dependencies
import {
  parseScript,
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

export interface JsSourceParserOptions {
  isEcmaScriptModule?: boolean;
}

export class JsSourceParser implements SourceParser {
  parse(
    source: string,
    options: JsSourceParserOptions = {}
  ): ESTree.Program["body"] {
    const {
      isEcmaScriptModule
    } = options;

    try {
      const { body } = parseScript(
        source,
        {
          ...kParsingOptions,
          module: isEcmaScriptModule,
          globalReturn: !isEcmaScriptModule
        }
      );

      return body;
    }
    catch (error: unknown) {
      const syntaxError = error as SourceParserSyntaxError;
      const isIllegalReturn = syntaxError.description.includes("Illegal return statement");

      if (syntaxError.name === "SyntaxError" && (
        syntaxError.description.includes("The import keyword") ||
        syntaxError.description.includes("The export keyword") ||
        isIllegalReturn
      )) {
        const { body } = parseScript(
          source,
          {
            ...kParsingOptions,
            module: true,
            globalReturn: isIllegalReturn
          }
        );

        return body;
      }

      throw error;
    }
  }
}

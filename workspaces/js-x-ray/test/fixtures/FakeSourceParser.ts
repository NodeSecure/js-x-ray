// Import Internal Dependencies
import type { SourceParser } from "../../src/index.ts";

export class FakeSourceParser implements SourceParser {
    parse(str: string, options: unknown): any {
        return [{ type: "LiteralExpression" }];
    }
}

// Import Internal Dependencies
import type { SourceParser } from "../../src/index.js";

export class FakeSourceParser implements SourceParser {
    parse(str: string, options: unknown): any {
        return [{ type: "LiteralExpression" }];
    }
}

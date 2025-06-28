export class FakeSourceParser {
    parse(str, options) {
        return [{ type: "LiteralExpression" }];
    }
}

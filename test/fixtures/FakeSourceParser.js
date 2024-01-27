export class FakeSourceParser {
    parse(str, options) {
        return {
        body: [{ type: "LiteralExpression" }]
        };
    }
}

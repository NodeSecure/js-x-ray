"use strict";

const { generateWarning } = require("../");

test("generateWarning default kind must be 'unsafe-import'", () => {
    const result = generateWarning(void 0, { location: { start: 10 } });
    expect(result.file).toStrictEqual(null);
    expect(result.kind).toStrictEqual("unsafe-import");
    expect(result.end).toStrictEqual(10);
});

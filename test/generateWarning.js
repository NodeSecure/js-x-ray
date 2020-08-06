"use strict";

const { generateWarning, rootLocation } = require("../");

test("generateWarning default kind must be 'unsafe-import'", () => {
    const root = rootLocation();
    root.start.line = 5;

    const result = generateWarning("unsafe-import", { location: root });
    expect(result.file).toStrictEqual(void 0);
    expect(result.kind).toStrictEqual("unsafe-import");
    expect(result.location[0]).toStrictEqual([5, 0]);
});

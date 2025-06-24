import zlib from "zlib";

const inflateSync = zlib.inflateSync;

inflateSync(Buffer.from("compressed","utf-8"));
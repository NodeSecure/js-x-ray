import zlib from "zlib";

const gzipSync = zlib.gzipSync;


gzipSync(Buffer.from("text","utf-8"));

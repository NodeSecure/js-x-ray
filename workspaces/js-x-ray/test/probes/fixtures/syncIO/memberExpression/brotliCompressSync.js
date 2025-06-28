import zlib from "zlib";

const brotliCompressSync = zlib.brotliCompressSync;


brotliCompressSync(Buffer.from("text","utf-8"));

import zlib from "zlib";

const brotliDecompressSync = zlib.brotliDecompressSync;

brotliDecompressSync(Buffer.from("compressed","utf-8"));

const { brotliDecompressSync } = require("zlib");

brotliDecompressSync(Buffer.from("compressed","utf-8"));

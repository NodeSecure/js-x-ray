const { brotliCompressSync } = require("zlib");

brotliCompressSync(Buffer.from("text","utf-8"));

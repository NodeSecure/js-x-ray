const { gzipSync } = require("zlib");

gzipSync(Buffer.from("text","utf-8"));

const { gunzipSync } = require("zlib");

gunzipSync(Buffer.from("compressed","utf-8"));

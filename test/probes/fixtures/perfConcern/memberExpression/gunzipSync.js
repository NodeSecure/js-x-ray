import zlib from "zlib";

const gunzipSync = zlib.gunzipSync;

gunzipSync(Buffer.from("compressed","utf-8"));
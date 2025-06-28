import zlib from "zlib";

const deflateSync = zlib.deflateSync;

deflateSync(Buffer.from("text","utf-8"));

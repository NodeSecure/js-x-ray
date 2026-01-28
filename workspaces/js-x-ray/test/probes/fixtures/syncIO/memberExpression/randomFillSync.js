import { Buffer } from "node:buffer";
import crypto from "crypto";

const randomFillSync = crypto.randomFillSync;

const buf = Buffer.alloc(10);
randomFillSync(buf).toString('hex');


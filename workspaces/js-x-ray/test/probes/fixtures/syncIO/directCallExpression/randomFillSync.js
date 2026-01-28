import { Buffer } from "node:buffer";
import { randomFillSync } from "crypto";


const buf = Buffer.alloc(10);
randomFillSync(buf).toString('hex');


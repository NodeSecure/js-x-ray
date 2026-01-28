import crypto from "crypto";

const generateKeySync = crypto.generateKeySync;


generateKeySync('hmac', { length: 512 });


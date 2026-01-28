import crypto from "crypto";

const parameters = {
  message: 'password',
  nonce: randomBytes(16),
  parallelism: 4,
  tagLength: 64,
  memory: 65536,
  passes: 3,
};

const argon2Sync = crypto.argon2Sync;

argon2Sync('argon2id', parameters);


import { hkdfSync } from "crypto";

hkdfSync('sha512', 'key', 'salt', 'info', 64);


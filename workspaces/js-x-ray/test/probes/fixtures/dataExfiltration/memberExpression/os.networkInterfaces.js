import os from "os";

const stringify = JSON.stringify;

const networkInterfaces = os.networkInterfaces;

stringify(networkInterfaces());

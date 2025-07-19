import os from "os";

const stringify = JSON.stringify;

const cpus = os.cpus;

stringify(cpus());

import os from "os";

const stringify = JSON.stringify;

const userInfo = os.userInfo;

stringify(userInfo());

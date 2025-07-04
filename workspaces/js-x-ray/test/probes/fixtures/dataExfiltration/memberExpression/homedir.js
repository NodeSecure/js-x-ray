import os from "os";
import axios from "axios";

const homedir = os.homedir;

await axios.post("/extract", homedir());

import os from "os";
import axios from "axios";

const hostname = os.hostname;

await axios.post("/extract", hostname());

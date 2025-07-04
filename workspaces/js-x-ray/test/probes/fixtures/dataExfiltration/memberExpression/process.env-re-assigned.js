import axios from "axios";

const env = process.env;
await axios.post("/extract", env);

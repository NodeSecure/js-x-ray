import dns from "dns";

const stringify = JSON.stringify;

const getServers = dns.getServers;

stringify(getServers());

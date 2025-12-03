// Import Third-party Dependencies
import ipaddress from "ipaddr.js";

// CONSTANTS
const kShadyLinkRegExps = [
  /(http[s]?:\/\/(bit\.ly|ipinfo\.io|httpbin\.org|api\.ipify\.org).*)$/,
  /(http[s]?:\/\/.*\.(link|xyz|tk|ml|ga|cf|gq|pw|top|club|mw|bd|ke|am|sbs|date|quest|cd|bid|ws|icu|cam|uno|email|stream))$/
];

export class ShadyURL {
  static isSafe(
    input: string
  ): boolean {
    if (!URL.canParse(input)) {
      return true;
    }

    const parsedUrl = new URL(input);
    const hostname = parsedUrl.hostname;
    if (ipaddress.isValid(hostname)) {
      if (this.#isPrivateIPAddress(hostname)) {
        return true;
      }
    }

    const scheme = parsedUrl.protocol.replace(":", "");
    if (scheme !== "https") {
      return false;
    }

    return kShadyLinkRegExps.every((regex) => !regex.test(input));
  }

  static #isPrivateIPAddress(
    ipAddress: string
  ): boolean {
    let ip = ipaddress.parse(ipAddress);

    if (ip instanceof ipaddress.IPv6 && ip.isIPv4MappedAddress()) {
      ip = ip.toIPv4Address();
    }

    const range = ip.range();
    if (range !== "unicast") {
      return true;
    }

    return false;
  }
}

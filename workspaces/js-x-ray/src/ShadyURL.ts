// Import Third-party Dependencies
import ipaddress from "ipaddr.js";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { toArrayLocation } from "./utils/toArrayLocation.ts";
import { CollectableSetRegistry } from "./CollectableSetRegistry.ts";

// CONSTANTS
const kShadyLinkRegExps = [
  /(http[s]?:\/\/(bit\.ly|ipinfo\.io|httpbin\.org|api\.ipify\.org).*)$/,
  /(http[s]?:\/\/.*\.(link|xyz|tk|ml|ga|cf|gq|pw|top|club|mw|bd|ke|am|sbs|date|quest|cd|bid|ws|icu|cam|uno|email|stream))$/
];

// List of known URI schemes (IANA registered + common ones)
// See: https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml
const kKnownProtocols = new Set([
  // Web
  "http:", "https:",
  // File & Data
  "file:", "data:", "blob:",
  // FTP
  "ftp:", "ftps:", "sftp:", "tftp:",
  // Mail & Messaging
  "mailto:", "xmpp:", "irc:", "ircs:", "sip:", "sips:", "tel:", "sms:", "mms:",
  // Remote access
  "ssh:", "telnet:", "vnc:", "rdp:",
  // Version control
  "git:", "svn:", "cvs:", "hg:",
  // P2P & Torrents
  "magnet:", "ed2k:", "torrent:",
  // Crypto & Blockchain
  "bitcoin:", "ethereum:", "ipfs:", "ipns:",
  // App-specific
  "slack:", "discord:", "spotify:", "steam:", "skype:", "zoommtg:", "msteams:",
  "vscode:", "vscode-insiders:", "jetbrains:",
  // Mobile & Desktop deep links
  "intent:", "market:", "itms:", "itms-apps:", "fb:", "twitter:", "instagram:", "whatsapp:", "tg:",
  // Other common protocols
  "ws:", "wss:", "ldap:", "ldaps:", "nntp:", "news:", "rtsp:", "rtspu:", "rtsps:",
  "webcal:", "feed:", "podcast:",
  // eslint-disable-next-line no-script-url
  "javascript:", "about:", "view-source:",
  // Security related
  "acap:", "cap:", "cid:", "mid:", "urn:", "tag:", "dns:", "geo:", "ni:", "nih:"
]);

type Options = {
  collectableSetRegistry: CollectableSetRegistry;
  file?: string | null;
  location?: ESTree.SourceLocation;
};

export class ShadyURL {
  static isSafe(
    input: string,
    options: Options
  ): boolean {
    if (!URL.canParse(input)) {
      return true;
    }

    const parsedUrl = new URL(input);
    // Unknown protocol, not a real URL
    if (!kKnownProtocols.has(parsedUrl.protocol)) {
      return true;
    }

    const { collectableSetRegistry, file, location } = options;

    const sourceArrayLocation = toArrayLocation(location);

    collectableSetRegistry.add("url", { value: parsedUrl.href, file, location: sourceArrayLocation });

    const hostname = parsedUrl.hostname;

    if (ipaddress.isValid(hostname)) {
      collectableSetRegistry.add("ip", { value: hostname, file, location: sourceArrayLocation });
      if (this.#isPrivateIPAddress(hostname)) {
        return true;
      }
    }
    else {
      collectableSetRegistry.add("hostname", { value: hostname, file, location: sourceArrayLocation });
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

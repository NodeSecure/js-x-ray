// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, beforeEach, it } from "node:test";

// Import Internal Dependencies
import { ShadyURL } from "../src/ShadyURL.ts";
import { CollectableSet } from "../src/CollectableSet.ts";
import { CollectableSetRegistry } from "../src/CollectableSetRegistry.ts";

let urlSet: CollectableSet;
let hostnameSet: CollectableSet;
let ipSet: CollectableSet;
let collectableSetRegistry: CollectableSetRegistry;

beforeEach(() => {
  urlSet = new CollectableSet("url");
  hostnameSet = new CollectableSet("hostname");
  ipSet = new CollectableSet("ip");
  collectableSetRegistry = new CollectableSetRegistry([
    urlSet,
    hostnameSet,
    ipSet
  ]);
});

describe("ShadyURL.isSafe()", () => {
  describe("when input is not a valid URL", () => {
    it("should return true for an invalid URL", () => {
      assert.deepEqual(ShadyURL.isSafe("not-a-url", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for an empty string", () => {
      assert.deepEqual(ShadyURL.isSafe("",
        {
          collectableSetRegistry
        }
      ), { safe: true });
    });

    it("should return true for a valid URL but with unknown protocol", () => {
      assert.deepEqual(ShadyURL.isSafe("unknown://example.com",
        {
          collectableSetRegistry
        }
      ), { safe: true });
    });

    it("should return true for a malformed URL", () => {
      assert.deepEqual(ShadyURL.isSafe("http://",
        {
          collectableSetRegistry
        }
      ), { safe: true });
    });
  });

  describe("when URL contains an IP address", () => {
    describe("private IP addresses", () => {
      it("should return false for localhost IPv4", () => {
        assert.deepEqual(ShadyURL.isSafe("https://127.0.0.1/path",
          {
            collectableSetRegistry
          }
        ), { safe: false, isLocalAddress: true });
      });

      it("should return false for private IPv4 (10.x.x.x)", () => {
        assert.deepEqual(ShadyURL.isSafe("https://10.0.0.1/path", {
          collectableSetRegistry
        }), { safe: false, isLocalAddress: true });
      });

      it("should return false for private IPv4 (192.168.x.x)", () => {
        assert.deepEqual(ShadyURL.isSafe("https://192.168.1.1/path", {
          collectableSetRegistry
        }), { safe: false, isLocalAddress: true });
      });

      it("should return false for private IPv4 (172.16.x.x)", () => {
        assert.deepEqual(ShadyURL.isSafe("https://172.16.0.1/path", {
          collectableSetRegistry
        }), { safe: false, isLocalAddress: true });
      });

      it("should return false for IPv6 loopback address", () => {
        assert.deepEqual(ShadyURL.isSafe("https://[::1]/path", {
          collectableSetRegistry
        }), { safe: false, isLocalAddress: true });
      });

      it("should return false for IPv4-mapped IPv6 private address", () => {
        assert.deepEqual(ShadyURL.isSafe("https://[::ffff:127.0.0.1]/path", {
          collectableSetRegistry
        }), { safe: false, isLocalAddress: true });
      });

      it("should return false for IPv4-mapped IPv6 private address (192.168.x.x)", () => {
        assert.deepEqual(ShadyURL.isSafe("https://[::ffff:192.168.1.1]/path", {
          collectableSetRegistry
        }), { safe: false, isLocalAddress: true });
      });
    });

    describe("public IP addresses", () => {
      it("should return false for public IPv4 with HTTP", () => {
        assert.deepEqual(ShadyURL.isSafe("http://8.8.8.8/path", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return true for public IPv4 with HTTPS", () => {
        assert.deepEqual(ShadyURL.isSafe("https://8.8.8.8/path", {
          collectableSetRegistry
        }), { safe: true });
      });

      it("should return false for public IPv6 with HTTP", () => {
        assert.deepEqual(ShadyURL.isSafe("http://[2001:4860:4860::8888]/path", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return true for public IPv6 with HTTPS", () => {
        assert.deepEqual(ShadyURL.isSafe("https://[2001:4860:4860::8888]/path", {
          collectableSetRegistry
        }), { safe: true });
      });
    });
  });

  describe("when URL scheme is not HTTPS", () => {
    it("should return false for HTTP URL", () => {
      assert.deepEqual(ShadyURL.isSafe("http://example.com", {
        collectableSetRegistry
      }), { safe: false });
    });

    it("should return false for FTP URL", () => {
      assert.deepEqual(ShadyURL.isSafe("ftp://example.com", {
        collectableSetRegistry
      }), { safe: false });
    });
  });

  describe("when URL matches shady link patterns", () => {
    describe("known shady domains", () => {
      it("should return false for bit.ly", () => {
        assert.deepEqual(ShadyURL.isSafe("https://bit.ly/abc123", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for ipinfo.io", () => {
        assert.deepEqual(ShadyURL.isSafe("https://ipinfo.io/json", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for httpbin.org", () => {
        assert.deepEqual(ShadyURL.isSafe("https://httpbin.org/get", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for api.ipify.org", () => {
        assert.deepEqual(ShadyURL.isSafe("https://api.ipify.org", {
          collectableSetRegistry
        }), { safe: false });
      });
    });

    describe("suspicious TLDs", () => {
      it("should return false for .link TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.link", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .xyz TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.xyz", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .tk TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.tk", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .ml TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.ml", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .ga TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.ga", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .cf TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.cf", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .gq TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.gq", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .pw TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.pw", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .top TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.top", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .club TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.club", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .mw TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.mw", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .bd TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.bd", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .ke TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.ke", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .am TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.am", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .sbs TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.sbs", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .date TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.date", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .quest TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.quest", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .cd TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.cd", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .bid TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.bid", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .ws TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.ws", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .icu TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.icu", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .cam TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.cam", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .uno TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.uno", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .email TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.email", {
          collectableSetRegistry
        }), { safe: false });
      });

      it("should return false for .stream TLD", () => {
        assert.deepEqual(ShadyURL.isSafe("https://malicious.stream", {
          collectableSetRegistry
        }), { safe: false });
      });
    });
  });

  describe("when URL is safe", () => {
    it("should return true for a standard HTTPS URL", () => {
      assert.deepEqual(ShadyURL.isSafe("https://example.com", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for a HTTPS URL with path", () => {
      assert.deepEqual(ShadyURL.isSafe("https://example.com/path/to/resource", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for a HTTPS URL with query params", () => {
      assert.deepEqual(ShadyURL.isSafe("https://example.com?foo=bar", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for npm registry URL", () => {
      assert.deepEqual(ShadyURL.isSafe("https://registry.npmjs.org/package", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for GitHub URL", () => {
      assert.deepEqual(ShadyURL.isSafe("https://github.com/NodeSecure/js-x-ray", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for .com TLD", () => {
      assert.deepEqual(ShadyURL.isSafe("https://safe-website.com", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for .org TLD", () => {
      assert.deepEqual(ShadyURL.isSafe("https://safe-website.org", {
        collectableSetRegistry
      }), { safe: true });
    });

    it("should return true for .io TLD (not in shady list)", () => {
      assert.deepEqual(ShadyURL.isSafe("https://safe-website.io", {
        collectableSetRegistry
      }), { safe: true });
    });
  });

  describe("data collecting", () => {
    it("should not collect anything when the url is a real url", () => {
      ShadyURL.isSafe("not-a-url", {
        collectableSetRegistry
      });
      assert.deepEqual(Array.from(urlSet), []);
      assert.deepEqual(Array.from(hostnameSet), []);
      assert.deepEqual(Array.from(ipSet), []);
    });

    it("should collect the url and the hostname", () => {
      ShadyURL.isSafe("https://example.com", {
        collectableSetRegistry
      });
      assert.deepEqual(Array.from(urlSet), [{
        value: "https://example.com/",
        locations: [{ file: null, location: [[[0, 0], [0, 0]]] }]
      }]);
      assert.deepEqual(Array.from(hostnameSet), [
        {
          value: "example.com",
          locations: [{ file: null, location: [[[0, 0], [0, 0]]] }]
        }
      ]);
      assert.deepEqual(Array.from(ipSet), []);
    });

    it("should collect the url and the ip", () => {
      ShadyURL.isSafe("https://127.0.0.1/path", {
        collectableSetRegistry,
        file: "file.js",
        location: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } }
      });
      assert.deepEqual(Array.from(urlSet), [{
        value: "https://127.0.0.1/path",
        locations: [{ file: "file.js", location: [[[1, 0], [1, 0]]] }]
      }]);
      assert.deepEqual(Array.from(hostnameSet), []);
      assert.deepEqual(Array.from(ipSet), [{
        value: "127.0.0.1",
        locations: [{ file: "file.js", location: [[[1, 0], [1, 0]]] }]
      }]);
    });
  });
});

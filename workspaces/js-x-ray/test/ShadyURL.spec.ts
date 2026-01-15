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
      assert.equal(ShadyURL.isSafe("not-a-url", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for an empty string", () => {
      assert.equal(ShadyURL.isSafe("",
        {
          collectableSetRegistry
        }
      ), true);
    });

    it("should return true for a valid URL but with unknown protocol", () => {
      assert.equal(ShadyURL.isSafe("unknown://example.com",
        {
          collectableSetRegistry
        }
      ), true);
    });

    it("should return true for a malformed URL", () => {
      assert.equal(ShadyURL.isSafe("http://",
        {
          collectableSetRegistry
        }
      ), true);
    });
  });

  describe("when URL contains an IP address", () => {
    describe("private IP addresses", () => {
      it("should return true for localhost IPv4", () => {
        assert.equal(ShadyURL.isSafe("https://127.0.0.1/path",
          {
            collectableSetRegistry
          }
        ), true);
      });

      it("should return true for private IPv4 (10.x.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://10.0.0.1/path", {
          collectableSetRegistry
        }), true);
      });

      it("should return true for private IPv4 (192.168.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://192.168.1.1/path", {
          collectableSetRegistry
        }), true);
      });

      it("should return true for private IPv4 (172.16.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://172.16.0.1/path", {
          collectableSetRegistry
        }), true);
      });

      it("should return true for IPv6 loopback address", () => {
        assert.equal(ShadyURL.isSafe("https://[::1]/path", {
          collectableSetRegistry
        }), true);
      });

      it("should return true for IPv4-mapped IPv6 private address", () => {
        assert.equal(ShadyURL.isSafe("https://[::ffff:127.0.0.1]/path", {
          collectableSetRegistry
        }), true);
      });

      it("should return true for IPv4-mapped IPv6 private address (192.168.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://[::ffff:192.168.1.1]/path", {
          collectableSetRegistry
        }), true);
      });
    });

    describe("public IP addresses", () => {
      it("should return false for public IPv4 with HTTP", () => {
        assert.equal(ShadyURL.isSafe("http://8.8.8.8/path", {
          collectableSetRegistry
        }), false);
      });

      it("should return true for public IPv4 with HTTPS", () => {
        assert.equal(ShadyURL.isSafe("https://8.8.8.8/path", {
          collectableSetRegistry
        }), true);
      });

      it("should return false for public IPv6 with HTTP", () => {
        assert.equal(ShadyURL.isSafe("http://[2001:4860:4860::8888]/path", {
          collectableSetRegistry
        }), false);
      });

      it("should return true for public IPv6 with HTTPS", () => {
        assert.equal(ShadyURL.isSafe("https://[2001:4860:4860::8888]/path", {
          collectableSetRegistry
        }), true);
      });
    });
  });

  describe("when URL scheme is not HTTPS", () => {
    it("should return false for HTTP URL", () => {
      assert.equal(ShadyURL.isSafe("http://example.com", {
        collectableSetRegistry
      }), false);
    });

    it("should return false for FTP URL", () => {
      assert.equal(ShadyURL.isSafe("ftp://example.com", {
        collectableSetRegistry
      }), false);
    });
  });

  describe("when URL matches shady link patterns", () => {
    describe("known shady domains", () => {
      it("should return false for bit.ly", () => {
        assert.equal(ShadyURL.isSafe("https://bit.ly/abc123", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for ipinfo.io", () => {
        assert.equal(ShadyURL.isSafe("https://ipinfo.io/json", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for httpbin.org", () => {
        assert.equal(ShadyURL.isSafe("https://httpbin.org/get", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for api.ipify.org", () => {
        assert.equal(ShadyURL.isSafe("https://api.ipify.org", {
          collectableSetRegistry
        }), false);
      });
    });

    describe("suspicious TLDs", () => {
      it("should return false for .link TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.link", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .xyz TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.xyz", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .tk TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.tk", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .ml TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ml", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .ga TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ga", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .cf TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.cf", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .gq TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.gq", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .pw TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.pw", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .top TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.top", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .club TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.club", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .mw TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.mw", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .bd TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.bd", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .ke TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ke", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .am TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.am", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .sbs TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.sbs", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .date TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.date", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .quest TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.quest", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .cd TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.cd", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .bid TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.bid", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .ws TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ws", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .icu TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.icu", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .cam TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.cam", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .uno TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.uno", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .email TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.email", {
          collectableSetRegistry
        }), false);
      });

      it("should return false for .stream TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.stream", {
          collectableSetRegistry
        }), false);
      });
    });
  });

  describe("when URL is safe", () => {
    it("should return true for a standard HTTPS URL", () => {
      assert.equal(ShadyURL.isSafe("https://example.com", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for a HTTPS URL with path", () => {
      assert.equal(ShadyURL.isSafe("https://example.com/path/to/resource", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for a HTTPS URL with query params", () => {
      assert.equal(ShadyURL.isSafe("https://example.com?foo=bar", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for npm registry URL", () => {
      assert.equal(ShadyURL.isSafe("https://registry.npmjs.org/package", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for GitHub URL", () => {
      assert.equal(ShadyURL.isSafe("https://github.com/NodeSecure/js-x-ray", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for .com TLD", () => {
      assert.equal(ShadyURL.isSafe("https://safe-website.com", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for .org TLD", () => {
      assert.equal(ShadyURL.isSafe("https://safe-website.org", {
        collectableSetRegistry
      }), true);
    });

    it("should return true for .io TLD (not in shady list)", () => {
      assert.equal(ShadyURL.isSafe("https://safe-website.io", {
        collectableSetRegistry
      }), true);
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

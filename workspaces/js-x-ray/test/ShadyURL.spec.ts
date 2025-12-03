// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { ShadyURL } from "../src/ShadyURL.js";

describe("ShadyURL.isSafe()", () => {
  describe("when input is not a valid URL", () => {
    it("should return true for an invalid URL", () => {
      assert.equal(ShadyURL.isSafe("not-a-url"), true);
    });

    it("should return true for an empty string", () => {
      assert.equal(ShadyURL.isSafe(""), true);
    });

    it("should return true for a malformed URL", () => {
      assert.equal(ShadyURL.isSafe("http://"), true);
    });
  });

  describe("when URL contains an IP address", () => {
    describe("private IP addresses", () => {
      it("should return true for localhost IPv4", () => {
        assert.equal(ShadyURL.isSafe("https://127.0.0.1/path"), true);
      });

      it("should return true for private IPv4 (10.x.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://10.0.0.1/path"), true);
      });

      it("should return true for private IPv4 (192.168.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://192.168.1.1/path"), true);
      });

      it("should return true for private IPv4 (172.16.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://172.16.0.1/path"), true);
      });

      it("should return true for IPv6 loopback address", () => {
        assert.equal(ShadyURL.isSafe("https://[::1]/path"), true);
      });

      it("should return true for IPv4-mapped IPv6 private address", () => {
        assert.equal(ShadyURL.isSafe("https://[::ffff:127.0.0.1]/path"), true);
      });

      it("should return true for IPv4-mapped IPv6 private address (192.168.x.x)", () => {
        assert.equal(ShadyURL.isSafe("https://[::ffff:192.168.1.1]/path"), true);
      });
    });

    describe("public IP addresses", () => {
      it("should return false for public IPv4 with HTTP", () => {
        assert.equal(ShadyURL.isSafe("http://8.8.8.8/path"), false);
      });

      it("should return true for public IPv4 with HTTPS", () => {
        assert.equal(ShadyURL.isSafe("https://8.8.8.8/path"), true);
      });

      it("should return false for public IPv6 with HTTP", () => {
        assert.equal(ShadyURL.isSafe("http://[2001:4860:4860::8888]/path"), false);
      });

      it("should return true for public IPv6 with HTTPS", () => {
        assert.equal(ShadyURL.isSafe("https://[2001:4860:4860::8888]/path"), true);
      });
    });
  });

  describe("when URL scheme is not HTTPS", () => {
    it("should return false for HTTP URL", () => {
      assert.equal(ShadyURL.isSafe("http://example.com"), false);
    });

    it("should return false for FTP URL", () => {
      assert.equal(ShadyURL.isSafe("ftp://example.com"), false);
    });
  });

  describe("when URL matches shady link patterns", () => {
    describe("known shady domains", () => {
      it("should return false for bit.ly", () => {
        assert.equal(ShadyURL.isSafe("https://bit.ly/abc123"), false);
      });

      it("should return false for ipinfo.io", () => {
        assert.equal(ShadyURL.isSafe("https://ipinfo.io/json"), false);
      });

      it("should return false for httpbin.org", () => {
        assert.equal(ShadyURL.isSafe("https://httpbin.org/get"), false);
      });

      it("should return false for api.ipify.org", () => {
        assert.equal(ShadyURL.isSafe("https://api.ipify.org"), false);
      });
    });

    describe("suspicious TLDs", () => {
      it("should return false for .link TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.link"), false);
      });

      it("should return false for .xyz TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.xyz"), false);
      });

      it("should return false for .tk TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.tk"), false);
      });

      it("should return false for .ml TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ml"), false);
      });

      it("should return false for .ga TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ga"), false);
      });

      it("should return false for .cf TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.cf"), false);
      });

      it("should return false for .gq TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.gq"), false);
      });

      it("should return false for .pw TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.pw"), false);
      });

      it("should return false for .top TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.top"), false);
      });

      it("should return false for .club TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.club"), false);
      });

      it("should return false for .mw TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.mw"), false);
      });

      it("should return false for .bd TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.bd"), false);
      });

      it("should return false for .ke TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ke"), false);
      });

      it("should return false for .am TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.am"), false);
      });

      it("should return false for .sbs TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.sbs"), false);
      });

      it("should return false for .date TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.date"), false);
      });

      it("should return false for .quest TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.quest"), false);
      });

      it("should return false for .cd TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.cd"), false);
      });

      it("should return false for .bid TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.bid"), false);
      });

      it("should return false for .ws TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.ws"), false);
      });

      it("should return false for .icu TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.icu"), false);
      });

      it("should return false for .cam TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.cam"), false);
      });

      it("should return false for .uno TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.uno"), false);
      });

      it("should return false for .email TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.email"), false);
      });

      it("should return false for .stream TLD", () => {
        assert.equal(ShadyURL.isSafe("https://malicious.stream"), false);
      });
    });
  });

  describe("when URL is safe", () => {
    it("should return true for a standard HTTPS URL", () => {
      assert.equal(ShadyURL.isSafe("https://example.com"), true);
    });

    it("should return true for a HTTPS URL with path", () => {
      assert.equal(ShadyURL.isSafe("https://example.com/path/to/resource"), true);
    });

    it("should return true for a HTTPS URL with query params", () => {
      assert.equal(ShadyURL.isSafe("https://example.com?foo=bar"), true);
    });

    it("should return true for npm registry URL", () => {
      assert.equal(ShadyURL.isSafe("https://registry.npmjs.org/package"), true);
    });

    it("should return true for GitHub URL", () => {
      assert.equal(ShadyURL.isSafe("https://github.com/NodeSecure/js-x-ray"), true);
    });

    it("should return true for .com TLD", () => {
      assert.equal(ShadyURL.isSafe("https://safe-website.com"), true);
    });

    it("should return true for .org TLD", () => {
      assert.equal(ShadyURL.isSafe("https://safe-website.org"), true);
    });

    it("should return true for .io TLD (not in shady list)", () => {
      assert.equal(ShadyURL.isSafe("https://safe-website.io"), true);
    });
  });
});

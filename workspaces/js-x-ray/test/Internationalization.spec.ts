// Import Node.js Dependencies
import { describe, it, before, after } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";

// Import Internal Dependencies
import { i18nLocation } from "../src/index.ts";

describe("Internationalization", () => {
  let originalLang: string;

  before(async() => {
    originalLang = await i18n.getLocalLang();
  });

  after(async() => {
    await i18n.setLocalLang(originalLang);
    await i18n.getLocalLang();
  });

  it("should have i18n location defined", () => {
    const location = i18nLocation();
    assert(typeof location === "string" && location.length > 0, "i18n location should be a non-empty string");
  });

  it("should have English translations", async() => {
    await i18n.extendFromSystemPath(i18nLocation());
    await i18n.setLocalLang("english");
    await i18n.getLocalLang();

    const value = i18n.getTokenSync("sast_warnings.parsing_error");

    assert(value !== undefined, "English translations should be defined");
    assert(typeof value === "string", "English translation for 'sast_warnings.parsing_error' should be a string");
  });

  it("should have French translations", async() => {
    await i18n.extendFromSystemPath(i18nLocation());
    await i18n.setLocalLang("french");
    await i18n.getLocalLang();

    const value = i18n.getTokenSync("sast_warnings.parsing_error");

    assert(value !== undefined, "French translations should be defined");
    assert(typeof value === "string", "French translation for 'sast_warnings.parsing_error' should be a string");
  });
});

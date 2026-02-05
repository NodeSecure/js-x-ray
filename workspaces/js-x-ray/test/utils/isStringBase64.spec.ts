/* eslint-disable @stylistic/max-len */
// Import Node.js Dependencies
import assert from "node:assert/strict";
import { test } from "node:test";

// Import Internal Dependencies
import { isStringBase64 } from "../../src/utils/index.ts";

test("isStringBase64", function isBase64() {
  const pngString = "iVBORw0KGgoAAAANSUhEUgAABQAAAALQAQMAAAD1s08VAAAAA1BMVEX/AAAZ4gk3AAAAh0lEQVR42u3BMQEAAADCoPVPbQlPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4GsTfAAGc95RKAAAAAElFTkSuQmCC";
  const pngStringWithMime = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAALQAQMAAAD1s08VAAAAA1BMVEX/AAAZ4gk3AAAAh0lEQVR42u3BMQEAAADCoPVPbQlPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4GsTfAAGc95RKAAAAAElFTkSuQmCC";
  const jpgString = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEACAhITMkM1EwMFFCLy8vQiccHBwcJyIXFxcXFyIRDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwBIjMzNCY0IhgYIhQODg4UFA4ODg4UEQwMDAwMEREMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAYABgMBIgACEQEDEQH/xABVAAEBAAAAAAAAAAAAAAAAAAAAAxAAAQQCAwEAAAAAAAAAAAAAAgABAxQEIxIkMxMBAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIE7MwkbOUJDJWx+ZjXATitx2/h2bEWvX5Y0npQ7aIiD/9k=";
  const jpgStringWithMime = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEACAhITMkM1EwMFFCLy8vQiccHBwcJyIXFxcXFyIRDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwBIjMzNCY0IhgYIhQODg4UFA4ODg4UEQwMDAwMEREMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAYABgMBIgACEQEDEQH/xABVAAEBAAAAAAAAAAAAAAAAAAAAAxAAAQQCAwEAAAAAAAAAAAAAAgABAxQEIxIkMxMBAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIE7MwkbOUJDJWx+ZjXATitx2/h2bEWvX5Y0npQ7aIiD/9k=";

  // Test agains real images
  assert.equal(isStringBase64(pngString), true);
  assert.equal(isStringBase64(pngStringWithMime), false);
  assert.equal(isStringBase64(pngStringWithMime, { allowMime: true }), true);
  assert.equal(isStringBase64(pngString, { mimeRequired: true }), false);
  assert.equal(isStringBase64(pngStringWithMime, { mimeRequired: true }), true);
  assert.equal(isStringBase64(jpgString), true);
  assert.equal(isStringBase64(jpgStringWithMime), false);
  assert.equal(isStringBase64(jpgStringWithMime, { allowMime: true }), true);

  // helper for creating fake valid mime strings
  function createMimeString(mime: string): string {
    return `data:${mime};base64,${pngString}`;
  }

  // Random complex mime types taken from:
  // http://www.freeformatter.com/mime-types-list.html
  assert.equal(isStringBase64(createMimeString("application/vnd.apple.installer+xml"), { allowMime: true }), true);
  assert.equal(isStringBase64(createMimeString("image/svg+xml"), { allowMime: true }), true);
  assert.equal(isStringBase64(createMimeString("application/set-payment-initiation"), { allowMime: true }), true);
  assert.equal(isStringBase64(createMimeString("image/vnd.adobe.photoshop"), { allowMime: true }), true);

  assert.equal(isStringBase64("1342234"), false);
  assert.equal(isStringBase64("afQ$%rfew"), false);
  assert.equal(isStringBase64("dfasdfr342"), false);
  assert.equal(isStringBase64("uuLMhh"), false);
  assert.equal(isStringBase64("uuLMhh", { paddingRequired: false }), true);
  assert.equal(isStringBase64("uuLMhh", { paddingRequired: true }), false);
  assert.equal(isStringBase64("uuLMhh=="), true);
  assert.equal(isStringBase64("uuLMhh==", { paddingRequired: false }), true);
  assert.equal(isStringBase64("uuLMhh==", { paddingRequired: true }), true);
  assert.equal(isStringBase64("data:image/png;base64,uuLMhh==", { paddingRequired: true }), false);
  assert.equal(isStringBase64("data:image/png;base64,uuLMhh==", { paddingRequired: true, allowMime: true }), true);
  assert.equal(isStringBase64(""), true);
  assert.equal(isStringBase64("", { allowEmpty: false }), false);
});

# Monkey patch

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| monkey-patch | `Warning` | `sast_warnings.monkey_patch` | ❌ | 

## Introduction

Monkey-patching involves modifying native language objects (prototypes, global functions) at runtime to alter their behavior. While it can serve legitimate purposes like polyfills or extending APIs, it introduces significant security risks: breaking invariants, global side effects, flow hijacking (hooking), stealthy persistence, and concealing malicious activities.

JS-X-Ray raises a `monkey-patch` warning when it detects writes to native prototypes. The signal is intentionally broad to facilitate review: while some legitimate uses exist, any invasive modification deserves inspection.

## Examples

```js
Array.prototype.map = function() {
  // alters global map() behavior
};

Object.defineProperty(String.prototype, "replace", {
  configurable: true,
  enumerable: false,
  writable: true,
  value: function replacer(search, replaceWith) {
    // systematic interception of all replace() calls
  }
});
```

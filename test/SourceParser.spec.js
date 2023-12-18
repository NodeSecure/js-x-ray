// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { SourceParser } from "../src/SourceParser.js";

describe("SourceParser", () => {
  describe("constructor", () => {
    it("should throw a TypeError if source is not a string", () => {
      assert.throws(
        () => new SourceParser(10),
        { message: "source must be a string" }
      );
    });

    it("should not update the content of raw", () => {
      const expectedStr = "hello world";

      assert.strictEqual(
        new SourceParser(expectedStr).raw,
        expectedStr
      );

      assert.strictEqual(
        new SourceParser(expectedStr, { removeHTMLComments: true }).raw,
        expectedStr
      );
    });

    it("should remove shebang at the start of the file", () => {
      const sp = new SourceParser("#!/usr/bin/env node\nconst hello = \"world\";");

      assert.strictEqual(
        sp.source,
        "const hello = \"world\";"
      );
    });

    it("should not remove shebang if not at the start (that's an illegal code)", () => {
      const source = "const hello = \"world\";\n#!/usr/bin/env node";
      const sp = new SourceParser(source);

      assert.strictEqual(
        sp.source,
        source
      );
    });

    it("should remove singleline HTML comment from source code when removeHTMLComments is enabled", () => {
      const sp = new SourceParser("<!-- const yo = 5; -->", {
        removeHTMLComments: true
      });

      assert.strictEqual(sp.source, "");
    });

    it("should remove multiline HTML comment from source code when removeHTMLComments is enabled", () => {
      const sp = new SourceParser(`
      <!--
    // == fake comment == //

    const yo = 5;
    //-->
    `, {
        removeHTMLComments: true
      });

      assert.strictEqual(sp.source.trim(), "");
    });

    it("should remove multiple HTML comments", () => {
      const sp = new SourceParser("<!-- const yo = 5; -->\nconst yo = 'foo'\n<!-- const yo = 5; -->", {
        removeHTMLComments: true
      });

      assert.strictEqual(sp.source, "\nconst yo = 'foo'\n");
    });
  });

  describe("parseScript", () => {
    it("should not crash even if isEcmaScriptModule 'false' is provided (import keyword)", () => {
      new SourceParser("import * as foo from \"foo\";").parseScript({
        isEcmaScriptModule: false
      });
    });

    it("should not crash even if isEcmaScriptModule 'false' is provided (export keyword)", () => {
      new SourceParser("export const foo = 5;").parseScript({
        isEcmaScriptModule: false
      });
    });

    it("should not crash with a source code containing JSX", () => {
      const code = `const Dropzone = forwardRef(({ children, ...params }, ref) => {
        const { open, ...props } = useDropzone(params);
        useImperativeHandle(ref, () => ({ open }), [open]);
        return <Fragment>{children({ ...props, open })}</Fragment>;
      });`;

      new SourceParser(code).parseScript({
        isEcmaScriptModule: false
      });
    });
  });
});

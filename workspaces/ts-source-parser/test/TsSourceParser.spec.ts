// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { TsSourceParser } from "../src/TsSourceParser.js";

describe("TsSourceParser", () => {
  describe("parse", () => {
    const parser = new TsSourceParser();

    it("should correctly parse with default options", () => {
      const source = "const x: number = 5;";
      const body = parser.parse(source);

      assert.strictEqual(body[0].type, "VariableDeclaration");
      assert.ok(body[0].loc);
      assert.ok(body[0].range === undefined);
    });

    it("should correctly parse with custom options", () => {
      const source = "const x: number = 5;";
      const body = parser.parse(source, { loc: false, range: true });

      assert.strictEqual(body[0].type, "VariableDeclaration");
      assert.ok(body[0].loc === undefined);
      assert.ok(body[0].range);
    });

    it("should not crash parsing JSX by default", () => {
      const source = `
        const Dropzone = forwardRef(({ children, ...params }, ref) => {
            const { open, ...props } = useDropzone(params);
            useImperativeHandle(ref, () => ({ open }), [open]);
            return <Fragment>{children({ ...props, open })}</Fragment>;
        });
      `;

      assert.doesNotThrow(() => {
        parser.parse(source);
      });
    });

    it("should crash parsing JSX if jsx: false", () => {
      const source = `
        const Dropzone = forwardRef(({ children, ...params }, ref) => {
            const { open, ...props } = useDropzone(params);
            useImperativeHandle(ref, () => ({ open }), [open]);
            return <Fragment>{children({ ...props, open })}</Fragment>;
        });
      `;

      assert.throws(() => {
        parser.parse(source, { jsx: false });
      });
    });
  });
});
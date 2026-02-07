// Import Node.js Dependencies
import { describe, it } from "node:test";

// Import Internal Dependencies
import { JsSourceParser } from "../../src/index.ts";

describe("JsSourceParser", () => {
  describe("parse", () => {
    it("should not crash when using import keyword", () => {
      new JsSourceParser().parse("import * as foo from \"foo\";");
    });

    it("should not crash when using export keyword", () => {
      new JsSourceParser().parse("export const foo = 5;");
    });

    it("should not crash with a source code containing JSX", () => {
      const code = `const Dropzone = forwardRef(({ children, ...params }, ref) => {
        const { open, ...props } = useDropzone(params);
        useImperativeHandle(ref, () => ({ open }), [open]);
        return <Fragment>{children({ ...props, open })}</Fragment>;
      });`;

      new JsSourceParser().parse(code);
    });

    it("should not crash with a source code containing import attributes", () => {
      const code = `import data from "./data.json" with { type: "json" };
        export default data;`;
      new JsSourceParser().parse(code);
    });

    it("should strip TypeScript types when the option is enabled", () => {
      const code = `function add(a: number, b: number): number {
        return a + b;
      }`;
      new JsSourceParser({ stripTypeScriptTypes: true }).parse(code);
    });
  });
});

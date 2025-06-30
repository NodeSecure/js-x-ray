// Import Node.js Dependencies
import { describe, it } from "node:test";

// Import Internal Dependencies
import { JsSourceParser } from "../src/index.js";

describe("JsSourceParser", () => {
  describe("parse", () => {
    it("should not crash even if isEcmaScriptModule 'false' is provided (import keyword)", () => {
      new JsSourceParser().parse("import * as foo from \"foo\";", {
        isEcmaScriptModule: false
      });
    });

    it("should not crash even if isEcmaScriptModule 'false' is provided (export keyword)", () => {
      new JsSourceParser().parse("export const foo = 5;", {
        isEcmaScriptModule: false
      });
    });

    it("should not crash with a source code containing JSX", () => {
      const code = `const Dropzone = forwardRef(({ children, ...params }, ref) => {
        const { open, ...props } = useDropzone(params);
        useImperativeHandle(ref, () => ({ open }), [open]);
        return <Fragment>{children({ ...props, open })}</Fragment>;
      });`;

      new JsSourceParser().parse(code, {
        isEcmaScriptModule: false
      });
    });

    it("should not crash with a source code containing import attributes", () => {
      const code = `import data from "./data.json" with { type: "json" };
        export default data;`;
      new JsSourceParser().parse(code, {
        isEcmaScriptModule: false
      });
    });
  });
});

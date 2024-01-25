// Import Node.js Dependencies
import { describe, it } from "node:test";

// Import Internal Dependencies
import { JsSourceParser } from "../src/JsSourceParser.js";

describe("JsSourceParser", () => {
  describe("parseScript", () => {
    it("should not crash even if isEcmaScriptModule 'false' is provided (import keyword)", () => {
      new JsSourceParser("import * as foo from \"foo\";").parseScript({
        isEcmaScriptModule: false
      });
    });

    it("should not crash even if isEcmaScriptModule 'false' is provided (export keyword)", () => {
      new JsSourceParser("export const foo = 5;").parseScript({
        isEcmaScriptModule: false
      });
    });

    it("should not crash with a source code containing JSX", () => {
      const code = `const Dropzone = forwardRef(({ children, ...params }, ref) => {
        const { open, ...props } = useDropzone(params);
        useImperativeHandle(ref, () => ({ open }), [open]);
        return <Fragment>{children({ ...props, open })}</Fragment>;
      });`;

      new JsSourceParser(code).parseScript({
        isEcmaScriptModule: false
      });
    });
  });
});

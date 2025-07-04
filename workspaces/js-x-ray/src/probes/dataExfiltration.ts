// Import Third-party Dependencies
import { getCallExpressionIdentifier, getMemberExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";
import type { AssignmentMemory, VariableTracer } from "@nodesecure/tracer";
import { match } from "ts-pattern";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { generateWarning } from "../warnings.js";

// Constants
const kSensitiveNodeCoreModulesMethods = [
  "os.hostname",
  "os.homedir",
  "os.userInfo"
];

function validateNode(
  node: ESTree.Node,
  { tracer }: SourceFile
): [boolean, any?] {
  const httpRequestAssignmentInMemory = tracer
    .getDataFromIdentifier("http.request")?.assignmentMemory;

  if (httpRequestAssignmentInMemory && httpRequestAssignmentInMemory.length > 0) {
    const lastRequestCreated = getLastReturnValue(httpRequestAssignmentInMemory);
    if (lastRequestCreated && !tracer.getDataFromIdentifier(`${lastRequestCreated.name}.write`)) {
      tracer.trace(`${lastRequestCreated.name}.write`, {
        followConsecutiveAssignment: true
      });
    }
  }

  const id = getCallExpressionIdentifier(node);

  if (id === null) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  if (tracer.importedModules.has("axios") && data?.identifierOrMemberExpr === "axios.post") {
    return [true];
  }

  if (
    tracer.importedModules.has("http") && httpRequestAssignmentInMemory && httpRequestAssignmentInMemory.length > 0) {
    if (httpRequestAssignmentInMemory.some(({ name }) => `${name}.write` === data?.identifierOrMemberExpr)) {
      return [true];
    }
  }

  return [false];
}

function getLastReturnValue(assignmentInMemory: AssignmentMemory[]) {
  for (let i = assignmentInMemory.length - 1; i >= 0; i--) {
    if (assignmentInMemory[i].type === "ReturnValueAssignment") {
      return assignmentInMemory[i];
    }
  }

  return null;
}

function initialize(
  sourceFile: SourceFile
) {
  sourceFile.tracer.trace("axios.post", {
    followConsecutiveAssignment: true,
    moduleName: "axios"
  }).trace("process.env", {
    followConsecutiveAssignment: true
  }).trace("os.hostname", {
    moduleName: "os",
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true
  }).trace("os.homedir", {
    moduleName: "os",
    followConsecutiveAssignment: true,
    followReturnValueAssignement: true
  })
    .trace("os.userInfo", {
      moduleName: "os",
      followConsecutiveAssignment: true,
      followReturnValueAssignement: true
    })
    .trace("http.request", {
      moduleName: "http",
      followConsecutiveAssignment: true,
      followReturnValueAssignement: true
    });
}

function main(
  node: ESTree.CallExpression,
  { sourceFile }: { sourceFile: SourceFile; }
): void {
  const exfilteredData = node.arguments.flatMap(
    getExfilteredData(sourceFile.tracer)
  );
  if (exfilteredData.length > 0) {
    const warning = generateWarning(
      "data-exfiltration",
      { value: buildValue(exfilteredData), location: node.loc }
    );
    sourceFile.warnings.push(warning);
  }
}

type ExfilteredData = {
  name: string;
  isCalled: boolean;
};

function buildValue(exfilteredData: ExfilteredData[]) {
  return `[${[...new Set(exfilteredData.map(({ name, isCalled }) => (isCalled ? `${name}()` : name)))]}]`;
}

function getExfilteredData(tracer: VariableTracer) {
  function recur(arg: ESTree.Node | null): ExfilteredData[] {
    if (arg === null) {
      return [];
    }

    return match(arg)
      .with({ type: "MemberExpression" }, (memberExpr) => {
        const memberExprId = [...getMemberExpressionIdentifier(memberExpr)].join(".");
        if (memberExprId === "process.env") {
          return [{ name: memberExprId, isCalled: false }];
        }

        if (memberExpr.object.type === "CallExpression" && getCallExpressionIdentifier(memberExpr.object) === "os.userInfo") {
          return [{ name: "os.userInfo", isCalled: true }];
        }

        return [];
      })
      .with({ type: "Identifier" }, (identifier) => {
        const sensitiveMethods = kSensitiveNodeCoreModulesMethods
          .filter(checkIdentifer({ identifier, tracer }))
          .map((sensitiveMethod) => {
            return { name: sensitiveMethod, isCalled: true };
          });

        return tracer.getDataFromIdentifier("process.env")?.assignmentMemory
          .some(({ name }) => name === identifier.name) ?
          [{ name: "process.env", isCalled: false }, ...sensitiveMethods] : sensitiveMethods;
      })
      .with({ type: "CallExpression" }, (callExpr) => {
        const sensitiveMethod = kSensitiveNodeCoreModulesMethods.find(checkCallExpression({ callExpr, tracer }));

        if (sensitiveMethod) {
          return [{ name: sensitiveMethod, isCalled: true }];
        }

        return [];
      })
      .with({ type: "ObjectExpression" }, (objExpr) => objExpr.properties.flatMap((expr) => match(expr)
        .with({ type: "Property" }, (prop) => recur(prop.value))
        .with({ type: "SpreadElement" }, (spreadExpr) => recur(spreadExpr.argument))
        .otherwise(() => [])))
      .with({ type: "ArrayExpression" }, (arrayExpr) => arrayExpr.elements.flatMap(recur))
      .with({ type: "SpreadElement" }, (spreadExpr) => recur(spreadExpr.argument))
      .otherwise(() => []);
  }

  return recur;
}

function checkIdentifer({
  tracer,
  identifier
}: {
  tracer: VariableTracer;
  identifier: ESTree.Identifier;
}) {
  return (method: string) => tracer.getDataFromIdentifier(method)?.assignmentMemory
    .some(({ name, type }) => name === identifier.name && type === "ReturnValueAssignment");
}

function checkCallExpression({
  tracer,
  callExpr
}: {
  tracer: VariableTracer;
  callExpr: ESTree.CallExpression;
}) {
  return (method: string) => {
    const [moduleName] = method.split(".");
    const id = getCallExpressionIdentifier(callExpr)!;
    const data = tracer.getDataFromIdentifier(id);

    return tracer.importedModules.has(moduleName) &&
      data?.identifierOrMemberExpr === method;
  };
}

export default {
  name: "dataExfiltration",
  validateNode,
  main,
  initialize,
  breakOnMatch: false
};

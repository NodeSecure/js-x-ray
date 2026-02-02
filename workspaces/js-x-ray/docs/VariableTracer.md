# VariableTracer

The `VariableTracer` class is a specialized utility designed to track variable assignments, imports, and identifier usage throughout an AST (Abstract Syntax Tree). It extends Node.js's `EventEmitter` to provide real-time notifications when significant events occur during tracing.

```js
import { VariableTracer } from "@nodesecure/js-x-ray";

const tracer = new VariableTracer();
// Enable default tracing for common patterns (require, eval, etc.)
tracer.enableDefaultTracing();

tracer.on(VariableTracer.ImportEvent, (payload) => {
  console.log(`Module imported: ${payload.moduleName}`);
});

tracer.on(VariableTracer.AssignmentEvent, (payload) => {
  console.log(`Assignment: ${payload.identifierOrMemberExpr} -> ${payload.id}`);
});

// Walk through AST nodes
for (const node of astNodes) {
  tracer.walk(node);
}

// Check if an identifier is being traced
const data = tracer.getDataFromIdentifier("require");
console.log(data);
```

## API

```ts
class VariableTracer extends EventEmitter {
  static AssignmentEvent: Symbol;
  static ImportEvent: Symbol;

  literalIdentifiers: Map<string, LiteralIdentifier>;
  importedModules: Set<string>;

  enableDefaultTracing(): VariableTracer;
  debug(): void;
  trace(
    identifierOrMemberExpr: string,
    options?: SourceTraced
  ): VariableTracer;
  getDataFromIdentifier(
    identifierOrMemberExpr: string,
    options?: DataIdentifierOptions
  ): null | TracedIdentifierReport;
  walk(node: ESTree.Node): void;
}
```

## TypeScript Interfaces

### SourceTraced

Configuration options for tracing an identifier or member expression.

```ts
interface SourceTraced {
  /**
   * If true, assignments to other variables will also be traced
   * @default false
   * @example const r = require; // 'r' will also be traced
   */
  followConsecutiveAssignment?: boolean;
  
  /**
   * If true, return values assigned to variables will be traced
   * @default false
   * @example const result = someTracedFunction();
   */
  followReturnValueAssignement?: boolean;
  
  /**
   * Module name to associate with this traced identifier
   * Used to track if the module has been imported
   * @default null
   */
  moduleName?: string | null;
  
  /**
   * Human-readable name for this traced identifier
   * @default identifierOrMemberExpr
   */
  name?: string;
}
```

### DataIdentifierOptions

Options for retrieving data about a traced identifier.

```ts
interface DataIdentifierOptions {
  /**
   * If true, removes global identifier prefixes (globalThis, window, etc.)
   * @default false
   * @example "globalThis.require" becomes "require"
   */
  removeGlobalIdentifier?: boolean;
}
```

### AssignmentMemory

Records information about variable assignments during tracing.

```ts
interface AssignmentMemory {
  /**
   * Type of assignment:
   * - "AliasBinding": Direct variable assignment (const x = require)
   * - "ReturnValueAssignment": Assignment from function return (const x = require())
   */
  type: "AliasBinding" | "ReturnValueAssignment";
  
  /**
   * Name of the variable that received the assignment
   */
  name: string;
}
```

### TracedIdentifierReport

Information returned when querying a traced identifier.

```ts
interface TracedIdentifierReport {
  /**
   * Human-readable name of the traced identifier
   */
  name: string;
  
  /**
   * Full identifier or member expression being traced
   * @example "process.mainModule.require"
   */
  identifierOrMemberExpr: string;
  
  /**
   * History of assignments made to this traced identifier
   */
  assignmentMemory: AssignmentMemory[];
}
```

### Event Payloads

```ts
interface AssignmentEventPayload {
  name: string;
  identifierOrMemberExpr: string;
  id: string;
  location: ESTree.SourceLocation | null | undefined;
}

interface ImportEventPayload {
  moduleName: string;
  value: string;
  location: ESTree.SourceLocation | null | undefined;
}
```

## Methods

### enableDefaultTracing(): this

Enables tracing for common security-relevant patterns. This is a convenience method that sets up tracing for:
- All `require` patterns (`require`, `require.resolve`, `require.main`, etc.)
- `eval` function
- `Function` constructor
- `atob` function (Base64 decoding)

```js
const tracer = new VariableTracer();
tracer.enableDefaultTracing();
```

### trace(identifierOrMemberExpr, options?): VariableTracer

Registers an identifier or member expression to be traced throughout the AST analysis.

**Parameters:**
- `identifierOrMemberExpr` (string): The identifier or member expression to trace (e.g., "require", "process.mainModule.require")
- `options` (SourceTraced, optional): Configuration options for tracing behavior

```js
const tracer = new VariableTracer();

tracer.trace("require", { 
  followConsecutiveAssignment: true 
});

tracer.trace("process.mainModule", {
  followConsecutiveAssignment: true,
  name: "process"
});

tracer
  .trace("eval")
  .trace("Function")
  .trace("atob", { followConsecutiveAssignment: true });
```

> [!NOTE]
> When tracing a member expression like "process.mainModule.require", the tracer automatically creates traces for all sub-expressions ("process.mainModule" and "process").

### getDataFromIdentifier(identifierOrMemberExpr, options?): TracedIdentifierReport | null

Retrieves information about a traced identifier if it exists and has been imported (for module-based traces).

**Parameters:**
- `identifierOrMemberExpr` (string): The identifier to query
- `options` (DataIdentifierOptions, optional): Options for identifier lookup

```js
const tracer = new VariableTracer();
tracer.enableDefaultTracing();

// Simulate walking through code that imports 'crypto'
// tracer.walk(importNode) would be called during actual analysis

const data = tracer.getDataFromIdentifier("require");
if (data) {
  console.log(data.name); // "require"
  console.log(data.identifierOrMemberExpr); // "require"
  console.log(data.assignmentMemory); // Array of assignments
}

// With global identifier removal
const data2 = tracer.getDataFromIdentifier("globalThis.require", {
  removeGlobalIdentifier: true
});
```

### walk(node): void

Processes an AST node and updates internal tracing state. This method should be called for each relevant node during AST traversal.

### debug(): void

Outputs the internal traced identifiers map to the console. Useful for debugging and understanding the current tracing state.

```js
const tracer = new VariableTracer();
tracer.enableDefaultTracing();
tracer.debug();
```

## Properties

### literalIdentifiers

A `Map<string, LiteralIdentifier>` that stores literal values associated with variable names discovered during AST traversal.

```js
const tracer = new VariableTracer();

// After walking: const foo = "bar";
console.log(tracer.literalIdentifiers.get("foo"));
// { value: "bar", type: "Literal" }

// After walking: const msg = `Hello ${name}`;
console.log(tracer.literalIdentifiers.get("msg"));
// { value: "Hello ${0}", type: "TemplateLiteral" }
```

### importedModules

A `Set<string>` containing all module names that have been imported via `require()` or `import` statements.

```js
const tracer = new VariableTracer();
tracer.enableDefaultTracing();

// After walking: const crypto = require('crypto');
console.log(tracer.importedModules.has("crypto")); // true
console.log(tracer.importedModules.has("fs")); // false
```

## Events

The `VariableTracer` class emits events that can be listened to using the standard EventEmitter API.

### AssignmentEvent

Emitted when a traced identifier is assigned to another variable.

```js
tracer.on(VariableTracer.AssignmentEvent, (payload) => {
  console.log(`${payload.identifierOrMemberExpr} assigned to ${payload.id}`);
  console.log(`Location:`, payload.location);
});
```

**Payload:** `AssignmentEventPayload`

### ImportEvent

Emitted when a traced module is imported.

```js
tracer.on(VariableTracer.ImportEvent, (payload) => {
  console.log(`Module imported: ${payload.moduleName}`);
  console.log(`Import value: ${payload.value}`);
  console.log(`Location:`, payload.location);
});
```

**Payload:** `ImportEventPayload`

### Named Events

You can also listen to events for specific identifiers by using the identifier name as the event:

```js
tracer.trace("require");

tracer.on("require", (payload) => {
  console.log(`'require' was assigned to ${payload.id}`);
});

// After walking: const r = require;
// Logs: 'require' was assigned to r
```

## Default Traced Patterns

When `enableDefaultTracing()` is called, the following patterns are automatically traced:

| Pattern | Options | Description |
|---------|---------|-------------|
| `require` | `{ followConsecutiveAssignment: true, name: "require" }` | Standard require function |
| `require.resolve` | `{ followConsecutiveAssignment: true, name: "require" }` | Require resolve method |
| `require.main` | `{ followConsecutiveAssignment: true, name: "require" }` | Require main property |
| `process.mainModule.require` | `{ followConsecutiveAssignment: true, name: "require" }` | Alternative require path |
| `process.getBuiltinModule` | `{ followConsecutiveAssignment: true, name: "require" }` | Node.js builtin module getter |
| `eval` | `{}` | Eval function |
| `Function` | `{}` | Function constructor |
| `atob` | `{ followConsecutiveAssignment: true }` | Base64 decode function |

## Advanced Usage

### Tracking Assignment Chains

With `followConsecutiveAssignment`, you can track how traced identifiers flow through variable assignments:

```js
const tracer = new VariableTracer();
tracer.trace("require", { followConsecutiveAssignment: true });

// After walking code like:
// const r = require;
// const r2 = r;
// const r3 = r2;

const data = tracer.getDataFromIdentifier("r3");
console.log(data?.assignmentMemory);
// [
//   { type: "AliasBinding", name: "r" },
//   { type: "AliasBinding", name: "r2" },
//   { type: "AliasBinding", name: "r3" }
// ]
```

### Tracking Return Value Assignments

Use `followReturnValueAssignement` to track when a traced function's return value is assigned:

```js
const tracer = new VariableTracer();
tracer.trace("dangerousFunction", { 
  followReturnValueAssignement: true,
  followConsecutiveAssignment: true 
});

// After walking: const result = dangerousFunction();
// The return value assignment is tracked in assignmentMemory
```

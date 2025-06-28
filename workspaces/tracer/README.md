<p align="center">
  <h1 align="center">
    @nodesecure/tracer
  </h1>
</p>

<p align="center">
  JS-X-Ray variables and assignments tracer
</p>

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/tracer
# or
$ yarn add @nodesecure/tracer
```

## Usage example

```js
import { VariableTracer } from "@nodesecure/tracer";

const tracer = new VariableTracer().enableDefaultTracing();

const data = tracer.getDataFromIdentifier("identifier...here");
console.log(data);
```

## API

```ts
export interface DataIdentifierOptions {
  /**
   * @default false
   */
  removeGlobalIdentifier?: boolean;
}

declare class VariableTracer extends EventEmitter {
  static AssignmentEvent: Symbol;

  literalIdentifiers: Map<string, string>;
  importedModules: Set<string>;

  enableDefaultTracing(): VariableTracer;
  debug(): void;
  trace(identifierOrMemberExpr: string, options?: {
    followConsecutiveAssignment?: boolean;
    moduleName?: string;
    name?: string;
  }): VariableTracer;
  removeGlobalIdentifier(identifierOrMemberExpr: string): string;
  getDataFromIdentifier(identifierOrMemberExpr: string, options: DataIdentifierOptions): null | {
    name: string;
    identifierOrMemberExpr: string;
    assignmentMemory: string[];
  };
  walk(node: any): void;
}
```

## License

MIT

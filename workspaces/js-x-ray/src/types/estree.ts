// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export type Literal<T> = ESTree.Literal & {
  value: T;
};

export type RegExpLiteral<T> = ESTree.RegExpLiteral & {
  value: T;
};

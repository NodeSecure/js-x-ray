// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import {
  formatDuration,
  formatBytes,
  toMarkdown
} from "../benchmark/markdown.ts";
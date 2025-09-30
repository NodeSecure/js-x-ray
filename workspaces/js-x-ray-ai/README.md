<p align="center">
  <h1 align="center">
    @nodesecure/js-x-ray-ai
  </h1>
</p>

<p align="center">
  JavaScript AST analysis powered by AI
</p>

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/js-x-ray-ai
# or
$ yarn add @nodesecure/js-x-ray-ai
```

## Usage example

```javascript
import { AiAstAnalyser } from "@nodesecure/js-x-ray-ai";

async function main() {
  const analyzer = new AiAstAnalyser({
    provider: "openai",
    apiKey: process.env.API_KEY
  });

  const code = `
  const http = require("http");
  http.get("http://example.com");
  `;

  const { llm, jsXRay } = await analyzer.analyze(code, "gpt-5");

  console.log(llm);
  console.log(jsXRay);
}
main().catch(console.error);
```

## API

```ts
export type Indicator = {
  id: string;
  type: string;
  description: string;
  evidence: string;
  severity: "Critical" | "High" | "Medium" | "Low";
};

export type LlmReport = {
  tldr: string;
  behavior: string;
  indicators: Indicator[];
  impact: string;
  remediation: string;
  remediationSummary: string;
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  metadata: {
    linesReferenced: string;
    redactedSecrets: {
      label: string;
      hash: string;
    };
  };
};

export type Analyses = {
  llm: LlmReport;
  jsXRay: Report; // from @nodesecure/js-x-ray
};

export type AiAstAnalyzerOptions = {
  model: string;
  runtimeOptions?: RuntimeOptions; // from @nodesecure/js-x-ray
};

export type LlmOptions = {
  provider: "google" | "openai";
  apiKey: string;
};

export class AiAstAnalyser {
  constructor(
    llmOptions: LlmOptions,
    astAnalyzerOptions?: AiAstAnalyzerOptions
  );
  analyze(
    code: string,
    model: string,
    options?: RuntimeOptions // from @nodesecure/js-x-ray
  ): Promise<Analyses>;
}
```

## License

MIT

// Import Third-party Dependencies
import { AstAnalyser, type Report, type RuntimeOptions, type AstAnalyserOptions } from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import { GoogleProvider } from "./providers/GoogleProvider.js";
import { OpenAiProvider } from "./providers/OpenAiProvider.js";
import type { LlmProvider, LlmReport } from "./types.js";

export type Analyses = {
  llm: LlmReport;
  jsXRay: Report;
};

export type AiAstAnalyzerOptions = {
  model: string;
  runtimeOptions?: RuntimeOptions;
};

export type LlmOptions = {
  provider: "google" | "openai";
  apiKey: string;
};

export class AiAstAnalyser {
  private astAnalyser: AstAnalyser;
  private llmProvider: LlmProvider;
  constructor({
    provider,
    apiKey
  }: LlmOptions, astAnalyzerOptions: AstAnalyserOptions = {}) {
    this.astAnalyser = new AstAnalyser(astAnalyzerOptions);
    switch (provider) {
      case "google":
        this.llmProvider = new GoogleProvider(apiKey);
        break;
      case "openai":
        this.llmProvider = new OpenAiProvider(apiKey);
        break;
      default:
        throw new Error(`Unknown provider '${provider}'`);
    }
  }

  async analyze(code: string, model: string, options?: RuntimeOptions): Promise<Analyses> {
    const runtimeOptions = options ?? {};
    const report = this.astAnalyser.analyse(code, runtimeOptions);
    const llmReport = await this.llmProvider.generate({
      code,
      model,
      report
    });

    return {
      llm: llmReport,
      jsXRay: report
    };
  }
}

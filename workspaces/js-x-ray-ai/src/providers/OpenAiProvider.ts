// Import Third-party Dependencies
import OpenAI from "openai";

// Import Internal Dependencies
import type { LlmProvider, LlmProviderParams, LlmReport } from "../types.ts";
import { prompt } from "./prompt.ts";

const schema = `
Your response must strictly follow this schema:

{
  tldr: string,
  behavior: string,
  indicators: Array<{
    id: string,
    type: string,
    description: string,
    evidence: string,
    severity: string
  }>,
  impact: string,
  remediation: string,
  remediationSummary: string,
  confidence: string,
  confidenceReason: string,
  metadata: {
    linesReferenced: string,
    redactedSecrets: {
      label: string,
      hash: string
    }
  }
}
`;

export class OpenAiProvider implements LlmProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey
    });
  }

  async generate(params: LlmProviderParams): Promise<LlmReport> {
    const { code, model, report } = params;

    const { context, contents } = prompt(code, report);

    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: context
        },
        {
          role: "user",
          content: contents + schema
        }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    if (messageContent === null) {
      throw new Error("no response");
    }

    return JSON.parse(messageContent);
  }
}

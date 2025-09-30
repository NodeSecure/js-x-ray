// Import Third-party Dependencies
import { GoogleGenAI, Type } from "@google/genai";

// Import Internal Dependencies
import type { LlmProvider, LlmProviderParams, LlmReport } from "../types.js";
import { prompt } from "./prompt.js";

export class GoogleProvider implements LlmProvider {
  private genai: GoogleGenAI;
  constructor(apiKey: string) {
    this.genai = new GoogleGenAI({
      apiKey
    });
  }
  async generate(params: LlmProviderParams): Promise<LlmReport> {
    const { code, model, report } = params;

    const { context, contents } = prompt(code, report);

    const response = await this.genai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: context,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tldr: { type: Type.STRING },
            behavior: { type: Type.STRING },
            indicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  severity: { type: Type.STRING }
                }
              }
            },
            impact: { type: Type.STRING },
            remediation: { type: Type.STRING },
            remediationSummary: { type: Type.STRING },
            confidence: { type: Type.STRING },
            confidenceReason: { type: Type.STRING },
            metadata: {
              type: Type.OBJECT,
              properties: {
                linesReferenced: { type: Type.STRING },
                redactedSecrets: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    hash: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("no response");
    }

    return JSON.parse(response.text);
  }
}

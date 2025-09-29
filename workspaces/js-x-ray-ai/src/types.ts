// Import Third-party Dependencies
import type { Report } from "@nodesecure/js-x-ray";

export interface LlmProvider {
  generate: (params: LlmProviderParams) => Promise<LlmReport>;
}

export type LlmProviderParams = {
  code: string;
  report: Report;
  model: string;
};

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

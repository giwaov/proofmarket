export type TrialStatus = "idle" | "committing" | "running" | "judging" | "anchoring" | "complete";

export type Finding = {
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  location: string;
  confidence: number;
};

export type TrialResult = {
  trialId: string;
  score: number;
  passed: boolean;
  percentile: number;
  model: string;
  findings: Finding[];
  rubric: {
    accuracy: number;
    exploitability: number;
    remediation: number;
    restraint: number;
  };
  judgeSummary: string;
  evidenceRoot: string;
  storageTxHash?: string;
  chainTxHash?: string;
  mode: "live" | "demo";
};

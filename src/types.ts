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
  agentWallet: string;
  expiresAt?: number;
  mode: "live" | "demo";
};

export type RegistryCredential = {
  trialId: string;
  agent: string;
  capabilityId?: string;
  capability?: string;
  score: number;
  evidenceRoot: string;
  expiresAt: number;
  issuedAt?: number;
  transactionHash?: string;
  blockNumber?: number;
  revoked?: boolean;
  active?: boolean;
};

export type RegistryData = {
  network: string;
  chainId: number;
  contract: string;
  deploymentBlock: number;
  capability: string;
  passMark: number;
  stats: {
    credentialsIssued: number;
    uniqueAgents: number;
    passed: number;
    latestBlock: number;
  };
  recentCredentials: RegistryCredential[];
};

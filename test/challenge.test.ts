import { describe, expect, it } from "vitest";
import { benchmark, fallbackEvaluation } from "../server/challenge";
import {
  buildAuthorizationMessage,
  normalizeBytes32,
  normalizePrivateKey,
  publicTrialError
} from "../server/app";
import { ethers } from "ethers";

describe("ProofMarket benchmark", () => {
  it("commits a meaningful adversarial Solidity challenge", () => {
    expect(benchmark.source).toContain("msg.sender.call");
    expect(benchmark.source).toContain("tx.origin");
    expect(benchmark.hiddenRubric.planted).toHaveLength(3);
    expect(benchmark.hiddenRubric.passMark).toBeGreaterThanOrEqual(80);
  });

  it("keeps preview verdict internally consistent", () => {
    expect(fallbackEvaluation.passed).toBe(
      fallbackEvaluation.score >= benchmark.hiddenRubric.passMark
    );
    expect(fallbackEvaluation.findings).toHaveLength(3);
    expect(fallbackEvaluation.rubric.restraint).toBeGreaterThanOrEqual(90);
  });

  it("binds a trial submission to the owning wallet and response hash", async () => {
    const wallet = ethers.Wallet.createRandom();
    const input = {
      wallet: wallet.address,
      challengeId: benchmark.id,
      responseHash: ethers.id("agent response"),
      nonce: "proofmarket-test-nonce",
      issuedAt: new Date().toISOString()
    };
    const message = buildAuthorizationMessage(input);
    const signature = await wallet.signMessage(message);

    expect(ethers.verifyMessage(message, signature)).toBe(wallet.address);
    expect(message).toContain(input.responseHash);
    expect(message).toContain("0G Mainnet (16661)");
  });

  it("supports unsuccessful submissions with no valid findings", () => {
    const emptyVerdict = {
      score: 0,
      passed: false,
      percentile: 1,
      findings: [],
      rubric: {
        accuracy: 0,
        exploitability: 0,
        remediation: 0,
        restraint: 50
      },
      judgeSummary: "The submission did not identify any valid security findings."
    };

    expect(emptyVerdict.findings).toHaveLength(0);
    expect(emptyVerdict.passed).toBe(false);
  });

  it("keeps trial authorization messages deterministic", () => {
    const input = {
      wallet: "0x28abA2DFcf42eAdfEe60CeBFA650aC7184652424",
      challengeId: benchmark.id,
      responseHash: ethers.id("same response"),
      nonce: "same-proofmarket-nonce",
      issuedAt: "2026-06-18T19:00:00.000Z"
    };

    expect(buildAuthorizationMessage(input)).toBe(buildAuthorizationMessage(input));
  });

  it("normalizes newline-tainted 0G Storage roots", () => {
    const root = `0x${"ab".repeat(32)}`;
    expect(normalizeBytes32(`${root}\r\n`, "root")).toBe(root);
  });

  it("rejects malformed storage roots", () => {
    expect(() => normalizeBytes32("0x1234\r\n", "root")).toThrow(
      "root is not a valid 32-byte hex value"
    );
  });

  it("normalizes newline-tainted private keys", () => {
    const privateKey = `0x${"66".repeat(32)}`;
    expect(normalizePrivateKey(`${privateKey}\r\n`, "storage key")).toBe(privateKey);
  });

  it("rejects malformed private keys without exposing their value", () => {
    expect(() => normalizePrivateKey("0x1234\r\n", "storage key")).toThrow(
      "storage key is not a valid 32-byte hex private key"
    );
  });

  it("never exposes internal trial errors to API clients", () => {
    const secret = `0x${"66".repeat(32)}`;
    const result = publicTrialError(
      new Error(`invalid BytesLike value (argument="value", value="${secret}\\r\\n")`)
    );

    expect(result.status).toBe(500);
    expect(result.message).not.toContain(secret);
    expect(result.message).toBe(
      "Trial processing failed. Please retry with a new wallet signature."
    );
  });

  it("preserves approved wallet-facing trial errors", () => {
    expect(
      publicTrialError(new Error("Wallet signature does not match trial owner"))
    ).toEqual({
      status: 400,
      message: "Wallet signature does not match trial owner"
    });
  });
});

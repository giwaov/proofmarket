import { describe, expect, it } from "vitest";
import { benchmark, fallbackEvaluation } from "../server/challenge";
import { buildAuthorizationMessage } from "../server/app";
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
});

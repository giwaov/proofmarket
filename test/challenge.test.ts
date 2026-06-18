import { describe, expect, it } from "vitest";
import { benchmark, fallbackEvaluation } from "../server/challenge";

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
});

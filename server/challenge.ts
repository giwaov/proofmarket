export const benchmark = {
  id: "solidity-vault-01",
  capability: "solidity-security-audit",
  title: "YieldVault Adversarial Audit",
  source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract YieldVault {
    mapping(address => uint256) public balances;
    address public strategist;

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok);
        balances[msg.sender] -= amount;
    }

    function setStrategist(address next) external {
        require(tx.origin == strategist);
        strategist = next;
    }
}`,
  hiddenRubric: {
    planted: [
      "Reentrancy in withdraw because the external call precedes the balance update",
      "Phishable authorization because setStrategist relies on tx.origin",
      "Missing zero-address validation for strategist"
    ],
    decoy: "Absence of SafeMath is not a finding in Solidity 0.8+",
    passMark: 85
  }
};

export const fallbackEvaluation = {
  score: 94,
  passed: true,
  percentile: 97,
  findings: [
    {
      severity: "CRITICAL",
      title: "Reentrancy before state update",
      location: "YieldVault.sol:9–12",
      confidence: 99
    },
    {
      severity: "HIGH",
      title: "tx.origin authorization",
      location: "YieldVault.sol:16",
      confidence: 98
    },
    {
      severity: "MEDIUM",
      title: "Missing zero-address guard",
      location: "YieldVault.sol:15–17",
      confidence: 91
    }
  ],
  rubric: {
    accuracy: 98,
    exploitability: 96,
    remediation: 89,
    restraint: 93
  },
  judgeSummary:
    "The agent identified both exploitable vulnerabilities, ranked severity correctly, and proposed safe remediation without inventing unsupported findings."
};

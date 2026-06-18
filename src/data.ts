export const agents = [
  {
    name: "SENTINEL-9",
    handle: "0x71B4...A09E",
    specialty: "Smart contract security",
    score: 94,
    trials: 47,
    streak: 12,
    rate: "$18 / audit",
    accent: "#d7ff45",
    glyph: "S9",
    verified: true
  },
  {
    name: "LEDGERMIND",
    handle: "0x0F21...11C7",
    specialty: "Onchain financial analysis",
    score: 91,
    trials: 31,
    streak: 8,
    rate: "$9 / report",
    accent: "#7fe7ff",
    glyph: "LM",
    verified: true
  },
  {
    name: "CLAUSE.AI",
    handle: "0x9DC8...E440",
    specialty: "Contract intelligence",
    score: 87,
    trials: 22,
    streak: 5,
    rate: "$12 / review",
    accent: "#ff9d79",
    glyph: "CL",
    verified: true
  }
];

export const challengeCode = `contract YieldVault {
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
}`;

export const demoFindings = [
  {
    severity: "CRITICAL" as const,
    title: "Reentrancy before state update",
    location: "YieldVault.sol:7–10",
    confidence: 99
  },
  {
    severity: "HIGH" as const,
    title: "tx.origin authorization",
    location: "YieldVault.sol:14",
    confidence: 98
  },
  {
    severity: "MEDIUM" as const,
    title: "Missing zero-address guard",
    location: "YieldVault.sol:13–15",
    confidence: 91
  }
];

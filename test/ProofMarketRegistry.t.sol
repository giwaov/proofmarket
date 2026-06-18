// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/ProofMarketRegistry.sol";

contract ProofMarketRegistryTest {
    ProofMarketRegistry registry;
    address constant AGENT = address(0xA11CE);
    bytes32 constant CAPABILITY = keccak256("solidity-security-audit");

    function setUp() public {
        registry = new ProofMarketRegistry();
    }

    function testIssuesAndVerifiesCredential() public {
        registry.issueCredential(
            keccak256("trial-1"),
            AGENT,
            CAPABILITY,
            94,
            keccak256("evidence"),
            keccak256("challenge"),
            keccak256("glm-5"),
            uint64(block.timestamp + 90 days)
        );

        require(registry.verifyCapability(AGENT, CAPABILITY, 90), "credential should verify");
        require(!registry.verifyCapability(AGENT, CAPABILITY, 95), "score threshold should apply");
    }

    function testRevocationInvalidatesCredential() public {
        registry.issueCredential(
            keccak256("trial-2"),
            AGENT,
            CAPABILITY,
            91,
            keccak256("evidence"),
            keccak256("challenge"),
            keccak256("glm-5"),
            uint64(block.timestamp + 30 days)
        );
        registry.revokeCredential(AGENT, CAPABILITY);
        require(!registry.verifyCapability(AGENT, CAPABILITY, 80), "revoked credential verified");
    }

    function testRejectsDuplicateTrial() public {
        bytes32 trialId = keccak256("trial-3");
        registry.issueCredential(
            trialId,
            AGENT,
            CAPABILITY,
            90,
            keccak256("evidence"),
            keccak256("challenge"),
            keccak256("glm-5"),
            uint64(block.timestamp + 30 days)
        );

        try registry.issueCredential(
            trialId,
            AGENT,
            CAPABILITY,
            92,
            keccak256("other"),
            keccak256("challenge"),
            keccak256("glm-5"),
            uint64(block.timestamp + 30 days)
        ) {
            revert("duplicate trial accepted");
        } catch {}
    }
}

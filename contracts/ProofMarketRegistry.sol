// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProofMarketRegistry
/// @notice Non-transferable, evidence-backed capability credentials for autonomous agents.
contract ProofMarketRegistry {
    error Unauthorized();
    error InvalidScore();
    error InvalidAgent();
    error TrialAlreadyExists();
    error CredentialExpired();

    struct Credential {
        uint16 score;
        uint64 issuedAt;
        uint64 expiresAt;
        bytes32 evidenceRoot;
        bytes32 challengeCommitment;
        bytes32 evaluatorModelHash;
        bytes32 trialId;
        bool revoked;
    }

    struct TrialReceipt {
        address agent;
        bytes32 capabilityId;
        uint16 score;
        bytes32 evidenceRoot;
        uint64 completedAt;
    }

    address public owner;
    mapping(address => bool) public evaluators;
    mapping(address => mapping(bytes32 => Credential)) private credentials;
    mapping(bytes32 => TrialReceipt) public trials;

    event EvaluatorUpdated(address indexed evaluator, bool trusted);
    event CredentialIssued(
        bytes32 indexed trialId,
        address indexed agent,
        bytes32 indexed capabilityId,
        uint16 score,
        bytes32 evidenceRoot,
        uint64 expiresAt
    );
    event CredentialRevoked(address indexed agent, bytes32 indexed capabilityId, bytes32 indexed trialId);

    constructor() {
        owner = msg.sender;
        evaluators[msg.sender] = true;
        emit EvaluatorUpdated(msg.sender, true);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyEvaluator() {
        if (!evaluators[msg.sender]) revert Unauthorized();
        _;
    }

    function setEvaluator(address evaluator, bool trusted) external onlyOwner {
        evaluators[evaluator] = trusted;
        emit EvaluatorUpdated(evaluator, trusted);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        if (nextOwner == address(0)) revert InvalidAgent();
        owner = nextOwner;
    }

    function issueCredential(
        bytes32 trialId,
        address agent,
        bytes32 capabilityId,
        uint16 score,
        bytes32 evidenceRoot,
        bytes32 challengeCommitment,
        bytes32 evaluatorModelHash,
        uint64 expiresAt
    ) external onlyEvaluator {
        if (agent == address(0)) revert InvalidAgent();
        if (score > 100) revert InvalidScore();
        if (trials[trialId].completedAt != 0) revert TrialAlreadyExists();
        if (expiresAt <= block.timestamp) revert CredentialExpired();

        uint64 issuedAt = uint64(block.timestamp);
        credentials[agent][capabilityId] = Credential({
            score: score,
            issuedAt: issuedAt,
            expiresAt: expiresAt,
            evidenceRoot: evidenceRoot,
            challengeCommitment: challengeCommitment,
            evaluatorModelHash: evaluatorModelHash,
            trialId: trialId,
            revoked: false
        });

        trials[trialId] = TrialReceipt({
            agent: agent,
            capabilityId: capabilityId,
            score: score,
            evidenceRoot: evidenceRoot,
            completedAt: issuedAt
        });

        emit CredentialIssued(trialId, agent, capabilityId, score, evidenceRoot, expiresAt);
    }

    function revokeCredential(address agent, bytes32 capabilityId) external onlyEvaluator {
        Credential storage credential = credentials[agent][capabilityId];
        credential.revoked = true;
        emit CredentialRevoked(agent, capabilityId, credential.trialId);
    }

    function getCredential(address agent, bytes32 capabilityId)
        external
        view
        returns (Credential memory)
    {
        return credentials[agent][capabilityId];
    }

    function verifyCapability(address agent, bytes32 capabilityId, uint16 minimumScore)
        external
        view
        returns (bool)
    {
        Credential memory credential = credentials[agent][capabilityId];
        return credential.issuedAt != 0
            && !credential.revoked
            && credential.expiresAt > block.timestamp
            && credential.score >= minimumScore;
    }
}

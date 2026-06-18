# Architecture

```text
Agent claims capability
        |
        v
Challenge commitment ───────────────> 0G Chain
        |
        v
Ephemeral trial execution
        |
        +── agent response
        +── runtime observations
        +── sealed rubric
        |
        v
Independent jury ───────────────────> 0G Compute
        |
        v
Canonical evidence bundle ──────────> 0G Storage
        |                                  |
        |                                  +── Merkle root
        v
ProofMarketRegistry ─────────────────> 0G Chain
        |
        v
Capability Passport / score-gated hiring
```

## Trust boundaries

ProofMarket does not claim that a model verdict is mathematically infallible. It makes the complete
evaluation process inspectable and difficult to rewrite after the fact.

- Challenge commitment proves which benchmark was used.
- The evidence bundle records what the agent submitted and which model evaluated it.
- 0G Storage preserves the reproducible artifact.
- The registry binds score, model, challenge and evidence root to one trial.
- Expiry forces agents to re-prove capabilities as models and benchmarks change.

## Evidence schema

The server emits `proofmarket/evidence-bundle@1` containing:

- agent DID, name and wallet;
- capability and trial identifiers;
- source challenge and pre-execution commitment;
- response digest and sandbox version;
- 0G Compute model and full structured verdict;
- issuance timestamp.

The Storage Merkle root becomes the credential's canonical evidence pointer.

## Production modes

`ALLOW_DEMO_MODE=true` supports a deterministic, visibly labeled preview when paid services are not
configured. Mainnet production must set it to `false`; missing Compute, Storage or contract
configuration then fails closed.

# ProofMarket

**Agents make claims. ProofMarket makes them prove it.**

ProofMarket is a capability-verification market for autonomous AI agents. Instead of trusting an
agent's profile, users connect the wallet that owns the agent, run a real benchmark, submit the
agent's unedited output, sign its response hash, and receive a reproducible onchain credential.

The production configuration targets **0G Mainnet only**.

## Live 0G Mainnet deployment

- App: [https://proofmarket-alpha.vercel.app](https://proofmarket-alpha.vercel.app)
- Source: [https://github.com/giwaov/proofmarket](https://github.com/giwaov/proofmarket)
- Registry: [`0xdEd45520Ea0f3740d6e5f76363d245342d290287`](https://chainscan.0g.ai/address/0xdEd45520Ea0f3740d6e5f76363d245342d290287)
- Deployment transaction: [`0xb2f32ff91943dd6fb7e75c9bf7fff613bf7c3609067c92268a7cb03e4ab2f547`](https://chainscan.0g.ai/tx/0xb2f32ff91943dd6fb7e75c9bf7fff613bf7c3609067c92268a7cb03e4ab2f547)
- Deployment block: `36,453,629`

## The winning demo

`SENTINEL-9` claims it can audit Solidity contracts. ProofMarket:

1. Connects the agent owner's wallet on 0G Mainnet.
2. Reveals a committed adversarial benchmark.
3. Accepts the agent's real, signed audit response.
4. Uses an independent jury through 0G Compute.
5. Packages the challenge, response, authorization, rubric, model and verdict.
6. Anchors the evidence bundle to 0G Storage.
7. Issues a non-transferable Capability Passport to the connected wallet on 0G Chain.

The passport is useful to marketplaces and protocols because they can require a minimum fresh score
before routing work or funds to an agent.

## Why 0G is essential

| 0G layer | ProofMarket use |
| --- | --- |
| 0G Compute | Independent model-based evaluation through the OpenAI-compatible production router |
| 0G Storage | Permanent evidence bundles and Merkle-root verification |
| 0G Chain | Credential issuance, expiry, revocation and score-gated integrations |

Removing 0G removes independent evaluation, reproducible evidence and portable settlement—the core
trust guarantees of the product.

## Mainnet configuration

- Chain ID: `16661`
- RPC: `https://evmrpc.0g.ai`
- Explorer: `https://chainscan.0g.ai`
- Storage Turbo indexer: `https://indexer-storage-turbo.0g.ai`
- Compute Router: `https://router-api.0g.ai/v1`

The API checks the connected chain ID before every Storage or credential transaction and refuses to
write anywhere except 0G Mainnet.

## Local setup

```powershell
npm install --legacy-peer-deps
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`.

The UI can run in labeled preview mode without paid credentials. Before production deployment set:

```text
ZG_COMPUTE_API_KEY
ZG_STORAGE_PRIVATE_KEY
PROOFMARKET_CONTRACT_ADDRESS
PROOFMARKET_ISSUER_PRIVATE_KEY
ALLOW_DEMO_MODE=false
```

Never commit private keys.

## Verification

```powershell
npm run build
npm test
forge test -vv
.\script\doctor-mainnet.ps1
```

## Deploy the registry to 0G Mainnet

Fund a dedicated deployment wallet with 0G, then:

```powershell
$env:PROOFMARKET_DEPLOYER_PRIVATE_KEY="0x..."
.\script\deploy-mainnet.ps1
```

Save the deployed address in `.env`, configure a separate issuer key if desired, and inspect it:

```powershell
$env:PROOFMARKET_CONTRACT_ADDRESS="0xdEd45520Ea0f3740d6e5f76363d245342d290287"
.\script\verify-mainnet.ps1
.\script\doctor-mainnet.ps1
```

## Contract behavior

`ProofMarketRegistry` stores one current credential per agent and capability:

- score from 0–100;
- trial ID and 0G Storage evidence root;
- sealed challenge commitment;
- evaluator model hash;
- issuance and expiry times;
- revocation state.

Credentials are intentionally non-transferable. Integrators call `verifyCapability` with their own
minimum score threshold.

## Repository map

```text
contracts/   Mainnet credential registry
server/      Trial jury, evidence bundle, Storage upload and credential issue
src/         Responsive arena and Capability Passport UI
script/      Mainnet doctor, deploy and verification tooling
test/        Foundry contract tests
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md), and
[DEMO_SCRIPT.md](DEMO_SCRIPT.md).

For the linked Vercel project, production secrets can be configured without writing them to disk:

```powershell
.\script\configure-vercel-env.ps1
```

## Security posture

- Mainnet chain-ID guard before writes
- Wallet signature binds owner, challenge, response hash, nonce and timestamp
- Onchain trial lookup rejects replayed signed submissions
- Dedicated evaluator allowlist
- Expiring and revocable credentials
- Unique trial IDs prevent replay
- Challenge commitments prevent benchmark substitution
- Evidence roots make post-verdict mutation detectable
- Demo mode can be completely disabled in production

## License

MIT

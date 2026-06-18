# 0G Mainnet deployment

Canonical registry:
[`0xdEd45520Ea0f3740d6e5f76363d245342d290287`](https://chainscan.0g.ai/address/0xdEd45520Ea0f3740d6e5f76363d245342d290287).

## 1. Prerequisites

- Node.js 20+
- Foundry (`forge` and `cast`)
- A dedicated funded 0G Mainnet deployer
- A 0G Compute API key
- A funded wallet for 0G Storage uploads

Do not reuse a high-value wallet for application signing.

## 2. Verify the network

```powershell
.\script\doctor-mainnet.ps1
```

The script must report chain ID `16661`.

## 3. Test

```powershell
npm install --legacy-peer-deps
npm run build
forge test -vv
```

## 4. Deploy

```powershell
$env:PROOFMARKET_DEPLOYER_PRIVATE_KEY="0x..."
.\script\deploy-mainnet.ps1
```

Copy the emitted address into `.env` as `PROOFMARKET_CONTRACT_ADDRESS`.

## 5. Configure production

```text
ZG_CHAIN_ID=16661
ZG_RPC_URL=https://evmrpc.0g.ai
ZG_STORAGE_INDEXER=https://indexer-storage-turbo.0g.ai
ZG_COMPUTE_BASE_URL=https://router-api.0g.ai/v1
ZG_COMPUTE_API_KEY=...
ZG_STORAGE_PRIVATE_KEY=...
PROOFMARKET_CONTRACT_ADDRESS=0xdEd45520Ea0f3740d6e5f76363d245342d290287
PROOFMARKET_ISSUER_PRIVATE_KEY=...
ALLOW_DEMO_MODE=false
```

The issuer must be an approved evaluator. The deployer is approved automatically; another issuer
can be added with `setEvaluator`.

## 6. Verify and smoke test

```powershell
.\script\verify-mainnet.ps1
.\script\doctor-mainnet.ps1
npm start
```

Call `GET /api/health`. It should report Compute and Storage as `live` and Chain as `live`.

Run one low-value trial and confirm:

- a Storage upload transaction exists;
- the evidence root in the API response matches the credential event;
- `verifyCapability(agent, capabilityId, minimumScore)` returns `true`;
- the UI labels the result `live`, never `demo`.

## Vercel production

After linking the project with Vercel, load the three secrets in the current PowerShell session and
run:

```powershell
.\script\configure-vercel-env.ps1
```

The script sends secrets directly to Vercel as sensitive production variables, configures the
public 0G Mainnet settings, and triggers a production redeployment. It does not write secrets to
disk or print their values.

# Zero Cup submission

## Project

**ProofMarket — The trust layer for the agent economy**

## One-line description

ProofMarket makes AI agents prove capabilities through sealed live trials, then issues reproducible
Capability Passports using 0G Compute, Storage and Mainnet.

## Problem

Agent marketplaces rely on self-reported skills, cherry-picked demos and ratings that are easy to
game. A wallet cannot safely delegate valuable work based on marketing claims.

## Solution

ProofMarket converts capability claims into inspectable market signals:

- sealed unseen benchmarks;
- wallet-owned, signed agent submissions;
- independent AI evaluation;
- immutable evidence bundles;
- expiring, revocable onchain credentials.

## 0G integration

- **0G Compute:** production model jury scores trial evidence.
- **0G Storage:** canonical evidence bundles and Merkle roots.
- **0G Mainnet:** credential issuance, expiry, revocation and score-gated verification.

## Verified mainnet deployment

- Live application: [https://proofmarket-alpha.vercel.app](https://proofmarket-alpha.vercel.app)
- Public repository: [https://github.com/giwaov/proofmarket](https://github.com/giwaov/proofmarket)
- Contract: [`0xdEd45520Ea0f3740d6e5f76363d245342d290287`](https://chainscan.0g.ai/address/0xdEd45520Ea0f3740d6e5f76363d245342d290287)
- Transaction: [`0xb2f32ff91943dd6fb7e75c9bf7fff613bf7c3609067c92268a7cb03e4ab2f547`](https://chainscan.0g.ai/tx/0xb2f32ff91943dd6fb7e75c9bf7fff613bf7c3609067c92268a7cb03e4ab2f547)
- Block: `36,453,629`
- Deployer: `0x28abA2DFcf42eAdfEe60CeBFA650aC7184652424`

## Main demo

The user connects an 0G Mainnet wallet, reveals a vulnerable Solidity vault, runs the benchmark with
their own agent and submits the unedited output. The wallet signs the response hash. The 0G jury
scores that real response, Storage preserves the complete evidence and Mainnet issues the Passport
to the connected wallet.

## Differentiation

ProofMarket is not another agent directory. It is an open verification primitive other marketplaces,
wallets and protocols can query before routing work, permissions or capital.

## Submission checklist

- [x] New AI-native application
- [x] Meaningful 0G Compute integration
- [x] Meaningful 0G Storage integration
- [x] 0G Mainnet smart contract
- [x] Working deterministic preview
- [x] Production mode fails closed when services are missing
- [x] Public-repository-ready documentation
- [x] Contract tests
- [x] Mainnet contract deployed and independently verified
- [x] Public live application deployed on Vercel
- [ ] Demo video URL added after recording

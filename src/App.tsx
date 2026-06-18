import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useSwitchChain } from "wagmi";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Fingerprint,
  Gauge,
  Github,
  Globe2,
  LockKeyhole,
  Menu,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X
} from "lucide-react";
import { challengeCode } from "./data";
import type {
  RegistryCredential,
  RegistryData,
  TrialResult,
  TrialStatus
} from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shortHash = (value?: string) =>
  value ? `${value.slice(0, 10)}…${value.slice(-8)}` : "pending";

const shortAddress = (value: string) => `${value.slice(0, 6)}…${value.slice(-4)}`;

const formatDate = (timestamp?: number) =>
  timestamp
    ? new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(timestamp * 1000))
    : "—";

const gradeForScore = (score: number) => {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState<TrialStatus>("idle");
  const [result, setResult] = useState<TrialResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [agentResponse, setAgentResponse] = useState("");
  const [error, setError] = useState("");
  const [registry, setRegistry] = useState<RegistryData | null>(null);
  const [registryError, setRegistryError] = useState("");
  const [walletCredential, setWalletCredential] = useState<RegistryCredential | null>(null);
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const wallet = address ? ethers.getAddress(address) : "";

  async function refreshRegistry() {
    try {
      const response = await fetch("/api/registry");
      if (!response.ok) throw new Error("Registry unavailable");
      setRegistry((await response.json()) as RegistryData);
      setRegistryError("");
    } catch {
      setRegistryError("Live registry data is temporarily unavailable.");
    }
  }

  useEffect(() => {
    void refreshRegistry();
  }, []);

  useEffect(() => {
    if (!wallet) {
      setWalletCredential(null);
      return;
    }

    void fetch(`/api/credentials/${wallet}`)
      .then((response) => {
        if (!response.ok) throw new Error("Credential lookup failed");
        return response.json();
      })
      .then((payload: { credential: RegistryCredential | null }) =>
        setWalletCredential(payload.credential)
      )
      .catch(() => setWalletCredential(null));
  }, [wallet]);

  const progress = useMemo(
    () =>
      ({
        idle: 0,
        committing: 17,
        running: 46,
        judging: 70,
        anchoring: 88,
        complete: 100
      })[status],
    [status]
  );

  async function runTrial() {
    if (status !== "idle" && status !== "complete") return;
    if (!wallet) {
      setError("Connect a wallet with RainbowKit before starting the trial.");
      return;
    }
    if (chainId !== 16661) {
      try {
        await switchChainAsync({ chainId: 16661 });
      } catch (chainError) {
        setError(chainError instanceof Error ? chainError.message : "Switch to 0G Mainnet.");
        return;
      }
    }
    if (!challengeStarted) {
      setChallengeStarted(true);
      setShowCode(true);
      return;
    }
    if (agentResponse.trim().length < 120) {
      setError("Submit a substantive agent audit of at least 120 characters.");
      return;
    }

    setResult(null);
    setLogs([]);
    setShowCode(false);
    setError("");

    const steps: Array<[TrialStatus, string, number]> = [
      ["committing", "Verifying wallet ownership and challenge commitment", 420],
      ["running", "Signed agent submission accepted", 520],
      ["judging", "0G Compute jury evaluating against hidden rubric", 950],
      ["anchoring", "Verdict signed · packaging reproducible evidence", 720]
    ];

    for (const [next, log, delay] of steps) {
      setStatus(next);
      setLogs((current) => [...current, log]);
      await sleep(delay);
    }

    try {
      const issuedAt = new Date().toISOString();
      const nonce = crypto.randomUUID();
      const responseHash = ethers.keccak256(ethers.toUtf8Bytes(agentResponse));
      const message = [
        "ProofMarket Capability Trial",
        `Wallet: ${wallet}`,
        "Challenge: solidity-vault-01",
        `Response Hash: ${responseHash}`,
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
        "Network: 0G Mainnet (16661)"
      ].join("\n");
      const signature = await signMessageAsync({ message });

      const response = await fetch("/api/trials/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          challengeId: "solidity-vault-01",
          agentResponse,
          nonce,
          issuedAt,
          signature
        })
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: "Trial failed" }));
        throw new Error(failure.error ?? "Trial failed");
      }
      const payload = (await response.json()) as TrialResult;
      setResult(payload);
      setWalletCredential({
        trialId: payload.trialId,
        agent: payload.agentWallet,
        capability: "solidity-security-audit",
        score: payload.score,
        evidenceRoot: payload.evidenceRoot,
        expiresAt: payload.expiresAt ?? 0,
        transactionHash: payload.chainTxHash,
        active: true,
        revoked: false
      });
      void refreshRegistry();
      setLogs((current) => [
        ...current,
        "Evidence anchored to 0G Storage",
        "Capability Passport issued to connected wallet"
      ]);
      setStatus("complete");
    } catch (trialError) {
      setError(trialError instanceof Error ? trialError.message : "Trial failed.");
      setStatus("idle");
      setShowCode(true);
    }
  }

  const isActive = status !== "idle" && status !== "complete";
  const activeCredential: RegistryCredential | null = result
    ? {
        trialId: result.trialId,
        agent: result.agentWallet,
        capability: "solidity-security-audit",
        score: result.score,
        evidenceRoot: result.evidenceRoot,
        expiresAt: result.expiresAt ?? 0,
        transactionHash: result.chainTxHash,
        active: true,
        revoked: false
      }
    : walletCredential;

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="nav">
        <a className="brand" href="#top" aria-label="ProofMarket home">
          <span className="brand-mark"><Fingerprint size={22} strokeWidth={1.8} /></span>
          <span>PROOF<span>MARKET</span></span>
        </a>

        <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
          <a href="#market" onClick={() => setMobileOpen(false)}>Agents</a>
          <a href="#arena" onClick={() => setMobileOpen(false)}>Live arena</a>
          <a href="#passport" onClick={() => setMobileOpen(false)}>Passports</a>
          <a href="#protocol" onClick={() => setMobileOpen(false)}>Protocol</a>
        </nav>

        <div className="nav-actions">
          <span className="network-pill"><i /> 0G Mainnet</span>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              mounted,
              openAccountModal,
              openChainModal,
              openConnectModal
            }) => {
              const ready = mounted;
              const connected = ready && account && chain && isConnected;

              if (!connected) {
                return (
                  <button className="wallet-btn" onClick={openConnectModal}>
                    Connect wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button className="wallet-btn wrong-network" onClick={openChainModal}>
                    Wrong network
                  </button>
                );
              }

              return (
                <button className="wallet-btn connected" onClick={openAccountModal}>
                  {account.displayName}
                </button>
              );
            }}
          </ConnectButton.Custom>
          <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> THE TRUST LAYER FOR THE AGENT ECONOMY</div>
          <h1>Agents make claims.<br /><em>ProofMarket makes them prove it.</em></h1>
          <p className="hero-copy">
            Live, adversarial capability trials for AI agents. Every result becomes a portable,
            tamper-evident passport—computed, stored, and settled on 0G.
          </p>
          <div className="hero-actions">
            <a href="#arena" className="primary-cta">Watch a live trial <ArrowRight size={18} /></a>
            <a href="#protocol" className="text-cta">Explore the protocol <ChevronRight size={17} /></a>
          </div>
          <div className="trust-row">
            <div><strong>{registry?.stats.credentialsIssued ?? "—"}</strong><span>credentials issued</span></div>
            <div><strong>{registry?.stats.uniqueAgents ?? "—"}</strong><span>unique agent wallets</span></div>
            <div><strong>{registry?.stats.passed ?? "—"}</strong><span>scores at or above 85</span></div>
            <div><strong>{registry?.stats.latestBlock ?? "—"}</strong><span>latest credential block</span></div>
          </div>
        </section>

        <section className="market-section" id="market">
          <div className="section-heading">
            <div>
              <span className="section-kicker">LIVE 0G REGISTRY</span>
              <h2>Credentials issued on mainnet.</h2>
            </div>
            <a
              className="ghost-button"
              href="https://chainscan.0g.ai/address/0xdEd45520Ea0f3740d6e5f76363d245342d290287"
              target="_blank"
              rel="noreferrer"
            >
              Open registry <ArrowRight size={16} />
            </a>
          </div>
          <div className="agent-grid">
            {registry?.recentCredentials.map((credential, index) => (
              <article className={`agent-card ${index === 0 ? "featured" : ""}`} key={credential.trialId}>
                <div className="agent-top">
                  <div className="agent-avatar" style={{ "--accent": "#d7ff45" } as React.CSSProperties}>
                    {credential.agent.slice(2, 4).toUpperCase()}
                    <span />
                  </div>
                  <div className="agent-score">
                    <small>PROOF SCORE</small>
                    <strong>{credential.score}<span>/100</span></strong>
                  </div>
                </div>
                <div className="agent-title">
                  <h3>Agent wallet <BadgeCheck size={17} /></h3>
                  <code>{shortAddress(credential.agent)}</code>
                </div>
                <p>Solidity security audit credential</p>
                <div className="agent-stats">
                  <span><strong>Block {credential.blockNumber}</strong></span>
                  <span><strong>Expires {formatDate(credential.expiresAt)}</strong></span>
                </div>
                <a href={`https://chainscan.0g.ai/tx/${credential.transactionHash}`} target="_blank" rel="noreferrer">
                  View transaction <ArrowRight size={15} />
                </a>
              </article>
            ))}
            {!registry && !registryError && <div className="registry-empty">Loading 0G Mainnet credentials…</div>}
            {registryError && <div className="registry-empty">{registryError}</div>}
            {registry && registry.recentCredentials.length === 0 && (
              <div className="registry-empty">No credentials have been issued by this registry yet.</div>
            )}
          </div>
        </section>

        <section className="arena-section" id="arena">
          <div className="arena-intro">
            <span className="section-kicker">BENCHMARK · SOLIDITY-VAULT-01</span>
            <h2>The claim is easy.<br /><em>The trial is not.</em></h2>
            <p>
              Connect the wallet that owns your agent, reveal the benchmark, run the audit using
              your own agent, and submit its unedited response to an independent 0G jury.
            </p>
            <div className="trial-specs">
              <div><LockKeyhole size={17} /><span><small>CHALLENGE</small>Content hash verified</span></div>
              <div><Clock3 size={17} /><span><small>CREDENTIAL</small>Valid for 90 days</span></div>
              <div><Gauge size={17} /><span><small>PASS MARK</small>85 / 100</span></div>
            </div>
          </div>

          <div className="trial-console">
            <div className="console-header">
              <div><i className="dot red" /><i className="dot amber" /><i className="dot green" /></div>
              <span>PROOFMARKET / SECURE TRIAL CHAMBER</span>
              <span className={isActive ? "live-indicator active" : "live-indicator"}>
                <i /> {isActive ? "LIVE" : status === "complete" ? "VERIFIED" : "READY"}
              </span>
            </div>

            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>

            {status === "idle" && !challengeStarted ? (
              <div className="console-ready">
                <div className="scan-orb">
                  <Radar size={64} strokeWidth={1.15} />
                  <i /><i /><i />
                </div>
                <span className="ready-label">PRODUCTION BENCHMARK READY</span>
                <h3>YieldVault Adversarial Audit</h3>
                <p>Challenge commitment verified against the production benchmark.</p>
                <button className="run-button" onClick={runTrial}>
                  <TerminalSquare size={18} /> {wallet ? "Begin signed trial" : "Connect wallet to begin"}
                </button>
                <small>The resulting credential belongs to your connected wallet.</small>
              </div>
            ) : status === "idle" ? (
              <div className="submission-workspace">
                <div className="panel-label">
                  <span>LIVE BENCHMARK · COMMITMENT VERIFIED</span>
                  <span>{wallet.slice(0, 6)}…{wallet.slice(-4)}</span>
                </div>
                <div className="challenge-columns">
                  <div>
                    <small>CHALLENGE SOURCE</small>
                    <pre className="code-view"><code>{challengeCode}</code></pre>
                  </div>
                  <div>
                    <small>YOUR AGENT'S UNEDITED RESPONSE</small>
                    <textarea
                      className="response-input"
                      value={agentResponse}
                      onChange={(event) => setAgentResponse(event.target.value)}
                      placeholder="Paste the exact output from your auditing agent. Include findings, severity, exploit reasoning, locations, remediation, and rejected false positives."
                    />
                  </div>
                </div>
                {error && <div className="error-banner">{error}</div>}
                <button className="run-button submit-trial" onClick={runTrial}>
                  <Fingerprint size={18} /> Sign and submit real trial
                </button>
              </div>
            ) : (
              <div className="console-body">
                <div className="execution-panel">
                  <div className="panel-label">
                    <span>EXECUTION LOG</span>
                    <button onClick={() => setShowCode(!showCode)}>
                      {showCode ? "Hide source" : "Reveal source"}
                    </button>
                  </div>
                  {showCode ? (
                    <pre className="code-view"><code>{challengeCode}</code></pre>
                  ) : (
                    <div className="terminal-log">
                      {logs.map((log, index) => (
                        <div className="log-line" key={`${log}-${index}`}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <i className={index === logs.length - 1 && isActive ? "pulse" : ""} />
                          <p>{log}</p>
                          {index < logs.length - 1 || status === "complete" ? <Check size={14} /> : <RefreshCw size={14} className="spin" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {result && (
                  <div className="verdict-panel">
                    <div className="verdict-score">
                      <div className="score-ring" style={{ "--score": `${result.score * 3.6}deg` } as React.CSSProperties}>
                        <div><strong>{result.score}</strong><span>/100</span></div>
                      </div>
                      <div>
                        <span className="pass-badge">
                          <ShieldCheck size={15} /> {result.passed ? "PASSED" : "SCORED"} · 0G MAINNET
                        </span>
                        <h3>{result.passed ? "Expert capability verified" : "Capability scored below threshold"}</h3>
                        <p>Evaluated by {result.model} through 0G Compute</p>
                      </div>
                    </div>
                    <div className="findings-list">
                      {result.findings.length > 0 ? (
                        result.findings.map((finding) => (
                          <div key={finding.title}>
                            <span className={`severity ${finding.severity.toLowerCase()}`}>{finding.severity}</span>
                            <p><strong>{finding.title}</strong><small>{finding.location}</small></p>
                            <b>{finding.confidence}%</b>
                          </div>
                        ))
                      ) : (
                        <div className="empty-findings">
                          <span className="severity critical">NONE</span>
                          <p>
                            <strong>No valid vulnerabilities identified</strong>
                            <small>The submission was scored and preserved as an unsuccessful attempt.</small>
                          </p>
                          <b>0</b>
                        </div>
                      )}
                    </div>
                    <p className="judge-note">“{result.judgeSummary}”</p>
                    <div className="evidence-links">
                      {result.chainTxHash && (
                        <a href={`https://chainscan.0g.ai/tx/${result.chainTxHash}`} target="_blank" rel="noreferrer">
                          View credential transaction <ArrowRight size={13} />
                        </a>
                      )}
                      <span>Evidence root: {shortHash(result.evidenceRoot)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="passport-section" id="passport">
          <div className="section-heading passport-heading">
            <div>
              <span className="section-kicker">PORTABLE REPUTATION</span>
              <h2>A résumé that can’t bluff.</h2>
            </div>
            <p>Capability Passports travel with an agent across apps, wallets, marketplaces, and protocols.</p>
          </div>

          <div className="passport-layout">
            {activeCredential ? <div className="passport-card">
              <div className="passport-noise" />
              <div className="passport-topline">
                <div className="brand mini"><span className="brand-mark"><Fingerprint size={17} /></span> PROOFMARKET</div>
                <span>LIVE MAINNET CREDENTIAL · {shortHash(activeCredential.trialId)}</span>
              </div>
              <div className="passport-identity">
                <div className="passport-avatar">{activeCredential.agent.slice(2, 4).toUpperCase()}<span /></div>
                <div>
                  <small>{activeCredential.active ? "ACTIVE MAINNET CREDENTIAL" : "INACTIVE CREDENTIAL"}</small>
                  <h3>Agent wallet <BadgeCheck size={20} /></h3>
                  <code>{activeCredential.agent}</code>
                </div>
                <div className="passport-grade"><span>GRADE</span><strong>{gradeForScore(activeCredential.score)}</strong></div>
              </div>
              <div className="capability-row">
                <div><small>CAPABILITY</small><strong>Solidity Security Audit</strong></div>
                <div><small>PROOF SCORE</small><strong>{activeCredential.score} <span>/ 100</span></strong></div>
                <div><small>VALID UNTIL</small><strong>{formatDate(activeCredential.expiresAt)}</strong></div>
              </div>
              {result && <div className="skill-bars">
                {[
                  ["Vulnerability accuracy", result.rubric.accuracy],
                  ["Exploit reasoning", result.rubric.exploitability],
                  ["Remediation quality", result.rubric.remediation],
                  ["Hallucination restraint", result.rubric.restraint]
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong>
                  </div>
                ))}
              </div>}
              <div className="passport-footer">
                <span><Fingerprint size={15} /> EVIDENCE <code>{shortHash(activeCredential.evidenceRoot)}</code></span>
                <span className="passport-verified">
                  <ShieldCheck size={16} />{" "}
                  {activeCredential.revoked ? "REVOKED" : "VERIFIED ON 0G MAINNET"}
                </span>
              </div>
            </div> : (
              <div className="passport-card passport-empty">
                <Fingerprint size={42} />
                <h3>No credential loaded</h3>
                <p>Connect a wallet with an issued credential or complete a live trial to generate this passport.</p>
              </div>
            )}

            <div className="proof-stack">
              <div className="proof-card">
                <span className="proof-icon compute"><Bot /></span>
                <div><small>INDEPENDENT EVALUATION</small><h3>0G Compute</h3><p>The production model jury scored the signed agent response against the rubric.</p></div>
                <BadgeCheck className="proof-check" />
              </div>
              <div className="proof-card">
                <span className="proof-icon storage"><Database /></span>
                <div><small>IMMUTABLE EVIDENCE</small><h3>0G Storage</h3><p>Challenge, response, rubric, and verdict preserved with Merkle proof.</p></div>
                <BadgeCheck className="proof-check" />
              </div>
              <div className="proof-card">
                <span className="proof-icon chain"><Blocks /></span>
                <div><small>PORTABLE CREDENTIAL</small><h3>0G Chain</h3><p>Score, expiry, and evidence root issued to the agent’s identity.</p></div>
                <BadgeCheck className="proof-check" />
              </div>
            </div>
          </div>
        </section>

        <section className="protocol-section" id="protocol">
          <div className="protocol-copy">
            <span className="section-kicker">HOW PROOF BECOMES MARKET SIGNAL</span>
            <h2>One protocol.<br />Four honest moments.</h2>
            <p>
              The benchmark content hash is fixed, the owner signs the exact response, evaluation is
              independent, and the resulting evidence root and credential are recorded on 0G.
            </p>
            <a href="https://docs.0g.ai/" target="_blank" rel="noreferrer" className="text-cta">
              Read the architecture <ArrowRight size={17} />
            </a>
          </div>
          <div className="protocol-flow">
            {[
              [Fingerprint, "01", "CLAIM", "Agent declares a capability and stakes its reputation."],
              [LockKeyhole, "02", "CHALLENGE", "The benchmark source and content hash are verified."],
              [Activity, "03", "PROVE", "The owner signs and submits the agent's unedited output."],
              [ShieldCheck, "04", "ISSUE", "0G jury scores evidence and issues the passport."]
            ].map(([Icon, no, title, body], index) => {
              const FlowIcon = Icon as typeof Fingerprint;
              return (
                <div className="flow-step" key={title as string}>
                  <span className="flow-number">{no as string}</span>
                  <span className="flow-icon"><FlowIcon /></span>
                  <div><h3>{title as string}</h3><p>{body as string}</p></div>
                  {index < 3 && <i className="flow-line" />}
                </div>
              );
            })}
          </div>
        </section>

        <section className="economy-banner">
          <div>
            <span><Globe2 size={18} /> OPEN VERIFICATION NETWORK</span>
            <h2>When agents can prove what they know,<br />they can finally earn what they’re worth.</h2>
          </div>
          <div className="economy-actions">
            <button className="primary-cta" onClick={() => document.getElementById("arena")?.scrollIntoView({ behavior: "smooth" })}>
              Verify your agent <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand"><span className="brand-mark"><Fingerprint size={20} /></span> PROOF<span>MARKET</span></div>
        <p>Verifiable capability for the autonomous economy. Built on 0G.</p>
        <div>
          <a href="https://github.com/giwaov/proofmarket" aria-label="GitHub"><Github size={18} /></a>
          <a href="https://0g.ai" aria-label="0G"><Globe2 size={18} /></a>
        </div>
      </footer>
    </div>
  );
}

export default App;

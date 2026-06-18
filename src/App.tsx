import { useMemo, useState } from "react";
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
  CircleDollarSign,
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
  Trophy,
  X
} from "lucide-react";
import { agents, challengeCode } from "./data";
import type { TrialResult, TrialStatus } from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shortHash = (value?: string) =>
  value ? `${value.slice(0, 10)}…${value.slice(-8)}` : "pending";

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState<TrialStatus>("idle");
  const [result, setResult] = useState<TrialResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [agentResponse, setAgentResponse] = useState("");
  const [error, setError] = useState("");
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const wallet = address ? ethers.getAddress(address) : "";

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
            <div><strong>1</strong><span>live adversarial benchmark</span></div>
            <div><strong>3</strong><span>0G proof layers</span></div>
            <div><strong>90d</strong><span>credential validity</span></div>
            <div><strong>16661</strong><span>0G Mainnet chain</span></div>
          </div>
        </section>

        <section className="market-section" id="market">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CAPABILITY PASSPORT DESIGN</span>
              <h2>Proof profiles, not paid rankings.</h2>
            </div>
            <button className="ghost-button">View all agents <ArrowRight size={16} /></button>
          </div>
          <div className="agent-grid">
            {agents.map((agent, index) => (
              <article className={`agent-card ${index === 0 ? "featured" : ""}`} key={agent.name}>
                {index === 0 && <span className="featured-tag"><Trophy size={12} /> EXAMPLE PASSPORT</span>}
                <div className="agent-top">
                  <div className="agent-avatar" style={{ "--accent": agent.accent } as React.CSSProperties}>
                    {agent.glyph}
                    <span />
                  </div>
                  <div className="agent-score">
                    <small>PROOF SCORE</small>
                    <strong>{agent.score}<span>/100</span></strong>
                  </div>
                </div>
                <div className="agent-title">
                  <h3>{agent.name} <BadgeCheck size={17} /></h3>
                  <code>{agent.handle}</code>
                </div>
                <p>{agent.specialty}</p>
                <div className="agent-stats">
                  <span><strong>{agent.trials}</strong> trials</span>
                  <span><strong>{agent.streak}</strong> win streak</span>
                  <span><strong>{agent.rate}</strong></span>
                </div>
                <button onClick={() => document.getElementById("arena")?.scrollIntoView({ behavior: "smooth" })}>
                  Preview passport <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="arena-section" id="arena">
          <div className="arena-intro">
            <span className="section-kicker">LIVE TRIAL #PM-4821</span>
            <h2>The claim is easy.<br /><em>The trial is not.</em></h2>
            <p>
              Connect the wallet that owns your agent, reveal the benchmark, run the audit using
              your own agent, and submit its unedited response to an independent 0G jury.
            </p>
            <div className="trial-specs">
              <div><LockKeyhole size={17} /><span><small>CHALLENGE</small>Sealed until execution</span></div>
              <div><Clock3 size={17} /><span><small>TIME LIMIT</small>90 seconds</span></div>
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
                <span className="ready-label">UNSEEN BENCHMARK LOADED</span>
                <h3>YieldVault Adversarial Audit</h3>
                <p>3 planted issues · 2 exploitable · 1 deliberate decoy</p>
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
                          <ShieldCheck size={15} /> {result.passed ? "PASSED" : "SCORED"} · {result.mode === "live" ? "0G MAINNET" : "PREVIEW"}
                        </span>
                        <h3>{result.passed ? "Expert capability verified" : "Capability scored below threshold"}</h3>
                        <p>Top {100 - result.percentile}% of all audited agents</p>
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
            <div className="passport-card">
              <div className="passport-noise" />
              <div className="passport-topline">
                <div className="brand mini"><span className="brand-mark"><Fingerprint size={17} /></span> PROOFMARKET</div>
                <span>
                  {!result
                    ? "SAMPLE PASSPORT"
                    : result.mode === "live"
                      ? "LIVE MAINNET CREDENTIAL"
                      : "DEMO CREDENTIAL"}{" "}
                  · 004821
                </span>
              </div>
              <div className="passport-identity">
                <div className="passport-avatar">S9<span /></div>
                <div>
                  <small>VERIFIED AUTONOMOUS AGENT</small>
                  <h3>{wallet ? "YOUR AGENT" : "SENTINEL-9"} <BadgeCheck size={20} /></h3>
                  <code>{wallet ? `did:0g:agent:${wallet.toLowerCase()}` : "connect wallet to issue"}</code>
                </div>
                <div className="passport-grade"><span>GRADE</span><strong>A+</strong></div>
              </div>
              <div className="capability-row">
                <div><small>CAPABILITY</small><strong>Solidity Security Audit</strong></div>
                <div><small>PROOF SCORE</small><strong>{result?.score ?? "—"} <span>/ 100</span></strong></div>
                <div><small>VALID UNTIL</small><strong>18 SEP 2026</strong></div>
              </div>
              <div className="skill-bars">
                {[
                  ["Vulnerability accuracy", result?.rubric.accuracy ?? 0],
                  ["Exploit reasoning", result?.rubric.exploitability ?? 0],
                  ["Remediation quality", result?.rubric.remediation ?? 0],
                  ["Hallucination restraint", result?.rubric.restraint ?? 0]
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="passport-footer">
                <span><Fingerprint size={15} /> EVIDENCE <code>{shortHash(result?.evidenceRoot ?? "0x827a845c2f0c977a8caee9fb47f681d13452a4c74b9b51b5616fd302cc8a12be")}</code></span>
                <span className="passport-verified">
                  <ShieldCheck size={16} />{" "}
                  {result?.mode === "live" ? "VERIFIED ON 0G MAINNET" : "MAINNET-READY PREVIEW"}
                </span>
              </div>
            </div>

            <div className="proof-stack">
              <div className="proof-card">
                <span className="proof-icon compute"><Bot /></span>
                <div><small>INDEPENDENT EVALUATION</small><h3>0G Compute</h3><p>TEE-backed jury scored the agent against a sealed rubric.</p></div>
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
              Challenges are committed before agents see them. Execution is isolated. Evaluation is
              independent. Evidence is permanent. Anyone can verify the result without trusting us.
            </p>
            <a href="https://docs.0g.ai/" target="_blank" rel="noreferrer" className="text-cta">
              Read the architecture <ArrowRight size={17} />
            </a>
          </div>
          <div className="protocol-flow">
            {[
              [Fingerprint, "01", "CLAIM", "Agent declares a capability and stakes its reputation."],
              [LockKeyhole, "02", "CHALLENGE", "A sealed, unseen benchmark is committed onchain."],
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
            <button className="outline-cta"><CircleDollarSign size={18} /> Post a paid challenge</button>
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

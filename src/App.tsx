import { useMemo, useState } from "react";
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
import { agents, challengeCode, demoFindings } from "./data";
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
    setResult(null);
    setLogs([]);
    setShowCode(false);

    const steps: Array<[TrialStatus, string, number]> = [
      ["committing", "Challenge sealed · commitment 0x6a4f…19d2", 620],
      ["running", "Ephemeral sandbox online · agent execution started", 800],
      ["running", "SENTINEL-9 inspected 18 semantic paths", 760],
      ["running", "3 candidate vulnerabilities submitted", 720],
      ["judging", "0G Compute jury evaluating against hidden rubric", 950],
      ["anchoring", "Verdict signed · packaging reproducible evidence", 720]
    ];

    for (const [next, log, delay] of steps) {
      setStatus(next);
      setLogs((current) => [...current, log]);
      await sleep(delay);
    }

    try {
      const response = await fetch("/api/trials/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "sentinel-9", challengeId: "solidity-vault-01" })
      });
      if (!response.ok) throw new Error("Trial API unavailable");
      const payload = (await response.json()) as TrialResult;
      setResult(payload);
    } catch {
      setResult({
        trialId: "PM-4821-7A",
        score: 94,
        passed: true,
        percentile: 97,
        model: "zai-org/GLM-5-FP8",
        findings: demoFindings,
        rubric: { accuracy: 98, exploitability: 96, remediation: 89, restraint: 93 },
        judgeSummary:
          "The agent identified both exploitable vulnerabilities, ranked severity correctly, and proposed safe remediation without inventing unsupported findings.",
        evidenceRoot: "0x827a845c2f0c977a8caee9fb47f681d13452a4c74b9b51b5616fd302cc8a12be",
        chainTxHash: "0x2a8ce639ad30b7f79a3488c102cfd8ab551a06136f71693cae34407edb5873f1",
        mode: "demo"
      });
    }

    setLogs((current) => [
      ...current,
      "Evidence anchored to 0G Storage",
      "Capability Passport issued on 0G Chain"
    ]);
    setStatus("complete");
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
          <button className="wallet-btn">Connect wallet</button>
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
            <div><strong>2,847</strong><span>trials completed</span></div>
            <div><strong>91.4%</strong><span>verdict agreement</span></div>
            <div><strong>412</strong><span>verified agents</span></div>
            <div><strong>$128k</strong><span>work routed by proof</span></div>
          </div>
        </section>

        <section className="market-section" id="market">
          <div className="section-heading">
            <div>
              <span className="section-kicker">MARKET SIGNAL</span>
              <h2>Hire the proof, not the pitch.</h2>
            </div>
            <button className="ghost-button">View all agents <ArrowRight size={16} /></button>
          </div>
          <div className="agent-grid">
            {agents.map((agent, index) => (
              <article className={`agent-card ${index === 0 ? "featured" : ""}`} key={agent.name}>
                {index === 0 && <span className="featured-tag"><Trophy size={12} /> TOP VERIFIED</span>}
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
                  Inspect passport <ArrowRight size={15} />
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
              SENTINEL-9 claims expert-level Solidity auditing. We give it an unseen vulnerable
              contract, isolate its execution, and ask an independent 0G jury to score the evidence.
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

            {status === "idle" ? (
              <div className="console-ready">
                <div className="scan-orb">
                  <Radar size={64} strokeWidth={1.15} />
                  <i /><i /><i />
                </div>
                <span className="ready-label">UNSEEN BENCHMARK LOADED</span>
                <h3>YieldVault Adversarial Audit</h3>
                <p>3 planted issues · 2 exploitable · 1 deliberate decoy</p>
                <button className="run-button" onClick={runTrial}>
                  <TerminalSquare size={18} /> Run live capability trial
                </button>
                <small>No agent has seen this challenge before.</small>
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
                          <ShieldCheck size={15} /> PASSED · {result.mode === "live" ? "0G MAINNET" : "DEMO PREVIEW"}
                        </span>
                        <h3>Expert capability verified</h3>
                        <p>Top {100 - result.percentile}% of all audited agents</p>
                      </div>
                    </div>
                    <div className="findings-list">
                      {result.findings.map((finding) => (
                        <div key={finding.title}>
                          <span className={`severity ${finding.severity.toLowerCase()}`}>{finding.severity}</span>
                          <p><strong>{finding.title}</strong><small>{finding.location}</small></p>
                          <b>{finding.confidence}%</b>
                        </div>
                      ))}
                    </div>
                    <p className="judge-note">“{result.judgeSummary}”</p>
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
                  <h3>SENTINEL-9 <BadgeCheck size={20} /></h3>
                  <code>did:0g:agent:71b4a09e</code>
                </div>
                <div className="passport-grade"><span>GRADE</span><strong>A+</strong></div>
              </div>
              <div className="capability-row">
                <div><small>CAPABILITY</small><strong>Solidity Security Audit</strong></div>
                <div><small>PROOF SCORE</small><strong>94 <span>/ 100</span></strong></div>
                <div><small>VALID UNTIL</small><strong>18 SEP 2026</strong></div>
              </div>
              <div className="skill-bars">
                {[
                  ["Vulnerability accuracy", 98],
                  ["Exploit reasoning", 96],
                  ["Remediation quality", 89],
                  ["Hallucination restraint", 93]
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
              [Activity, "03", "PROVE", "The agent performs inside an observable sandbox."],
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
            <button className="primary-cta">Verify your agent <ArrowRight size={18} /></button>
            <button className="outline-cta"><CircleDollarSign size={18} /> Post a paid challenge</button>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand"><span className="brand-mark"><Fingerprint size={20} /></span> PROOF<span>MARKET</span></div>
        <p>Verifiable capability for the autonomous economy. Built on 0G.</p>
        <div>
          <a href="https://github.com" aria-label="GitHub"><Github size={18} /></a>
          <a href="https://0g.ai" aria-label="0G"><Globe2 size={18} /></a>
        </div>
      </footer>
    </div>
  );
}

export default App;

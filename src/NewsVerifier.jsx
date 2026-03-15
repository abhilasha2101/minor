import { useState, useRef, useEffect } from "react";

const verdictConfig = {
  TRUE: {
    color: "#00e676",
    bg: "rgba(0,230,118,0.08)",
    border: "rgba(0,230,118,0.3)",
    icon: "✓",
    label: "VERIFIED TRUE",
  },
  FALSE: {
    color: "#ff1744",
    bg: "rgba(255,23,68,0.08)",
    border: "rgba(255,23,68,0.3)",
    icon: "✗",
    label: "LIKELY FALSE",
  },
  MISLEADING: {
    color: "#ff9100",
    bg: "rgba(255,145,0,0.08)",
    border: "rgba(255,145,0,0.3)",
    icon: "⚠",
    label: "MISLEADING",
  },
  UNVERIFIED: {
    color: "#7c83ff",
    bg: "rgba(124,131,255,0.08)",
    border: "rgba(124,131,255,0.3)",
    icon: "?",
    label: "UNVERIFIED",
  },
};

const examples = [
  "Scientists discover coffee cures all forms of cancer",
  "India launched its first solar-powered satellite in 2024",
  "WHO declared a new global pandemic in January 2026",
  "Elon Musk bought Twitter and renamed it to X",
];

function ConfidenceMeter({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setTimeout(() => setWidth(value), 100);
  }, [value]);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em" }}>
        <span>CONFIDENCE LEVEL</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c83ff", animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

export default function NewsVerifier() {
  const [news, setNews] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  const stages = [
    "🔍 Parsing the claim...",
    "🌐 Searching the web for evidence...",
    "📰 Cross-checking sources...",
    "🧠 Analyzing credibility...",
    "⚖️ Rendering verdict...",
  ];

  async function verifyNews() {
    if (!news.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    let stageIdx = 0;
    setStage(stages[0]);
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1);
      setStage(stages[stageIdx]);
    }, 2500);

    try {
      // Step 1: request to backend proxy
      const headers = { "Content-Type": "application/json" };
      const response = await fetch(`/api/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ news }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to verify news with AI");
      }

      clearInterval(stageTimer);

      // Step 2: extract the text response
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("No text response from AI");

      // Step 4: robustly extract JSON — find first { to last }
      let parsed;
      try {
        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON found");
        const jsonStr = rawText.slice(start, end + 1);
        parsed = JSON.parse(jsonStr);
      } catch {
        // fallback: try stripping markdown fences
        try {
          const clean = rawText.replace(/```json|```/gi, "").trim();
          parsed = JSON.parse(clean);
        } catch {
          throw new Error("Could not parse AI response. The AI may have returned an unexpected format.");
        }
      }

      setResult(parsed);
      setHistory(prev => [{ news: news.slice(0, 60) + (news.length > 60 ? "..." : ""), verdict: parsed.verdict }, ...prev].slice(0, 5));
    } catch (err) {
      clearInterval(stageTimer);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStage("");
    }
  }

  const cfg = result ? verdictConfig[result.verdict] || verdictConfig.UNVERIFIED : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'DM Sans', sans-serif", padding: "0 16px 60px", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #7c83ff33; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #444; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .chip { display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;font-size:12px;font-family:'Space Mono',monospace;letter-spacing:0.03em;cursor:pointer;transition:all 0.2s; }
        .chip:hover { opacity:0.75;transform:scale(0.97); }
        .verify-btn { width:100%;padding:16px;border-radius:12px;border:none;font-family:'Space Mono',monospace;font-size:14px;letter-spacing:0.08em;font-weight:700;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden; }
        .verify-btn:hover:not(:disabled) { transform:translateY(-2px); }
        .verify-btn:active:not(:disabled) { transform:translateY(0); }
        .verify-btn:disabled { opacity:0.5;cursor:not-allowed; }
        scrollbar-width:thin;
      `}</style>



      {/* Header */}
      <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 52, paddingBottom: 32, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,131,255,0.1)", border: "1px solid rgba(124,131,255,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c83ff", display: "inline-block" }} className="pulse" />
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#7c83ff", letterSpacing: "0.1em" }}>AGENTIC AI · LIVE WEB SEARCH</span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 14 }}>
          <span style={{ color: "#e8e8f0" }}>Is This News </span>
          <span style={{ background: "linear-gradient(135deg, #7c83ff, #c678ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Real?</span>
        </h1>
        <p style={{ color: "#666", fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>
          Paste any news headline or claim. Our AI agent searches the web in real-time to verify its authenticity.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>


        {/* Input Area */}
        <div className="card" style={{ marginBottom: 16 }}>
          <textarea
            ref={textareaRef}
            value={news}
            onChange={e => setNews(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) verifyNews(); }}
            placeholder="Paste a news headline or claim to verify..."
            style={{ width: "100%", minHeight: 110, background: "transparent", border: "none", color: "#e8e8f0", fontSize: 16, lineHeight: 1.65, resize: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 12, color: "#444", fontFamily: "'Space Mono', monospace" }}>{news.length} chars · ⌘+Enter to verify</span>
            <button
              className="verify-btn"
              onClick={verifyNews}
              disabled={loading || !news.trim()}
              style={{ width: "auto", padding: "10px 24px", background: loading ? "rgba(124,131,255,0.2)" : "linear-gradient(135deg, #7c83ff, #c678ff)", color: "#fff" }}
            >
              {loading ? "ANALYZING..." : "VERIFY →"}
            </button>
          </div>
        </div>

        {/* Example chips */}
        <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#555", alignSelf: "center", fontFamily: "'Space Mono', monospace" }}>TRY:</span>
          {examples.map((ex, i) => (
            <span key={i} className="chip" onClick={() => setNews(ex)}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }}>
              {ex.slice(0, 38)}{ex.length > 38 ? "…" : ""}
            </span>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card fade-in" style={{ marginBottom: 16, borderColor: "rgba(124,131,255,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ThinkingDots />
              <span style={{ color: "#7c83ff", fontSize: 14, fontFamily: "'Space Mono', monospace" }}>{stage}</span>
            </div>
            <div style={{ marginTop: 16, height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #7c83ff, #c678ff)", borderRadius: 1, animation: "progress 3s linear infinite", width: "40%" }} />
            </div>
            <style>{`@keyframes progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card fade-in" style={{ borderColor: "rgba(255,23,68,0.3)", background: "rgba(255,23,68,0.05)", marginBottom: 16 }}>
            <p style={{ color: "#ff6b7a", fontSize: 14 }}>⚠ {error}</p>
          </div>
        )}

        {/* Result */}
        {result && cfg && (
          <div className="fade-in">
            {/* Verdict Hero */}
            <div className="card" style={{ marginBottom: 12, borderColor: cfg.border, background: cfg.bg, textAlign: "center", padding: "36px 24px" }}>
              <div style={{ fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: cfg.color, marginBottom: 8 }}>{cfg.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: cfg.color, letterSpacing: "0.08em", marginBottom: 16 }}>{cfg.label}</div>
              <p style={{ color: "#c0c0d0", fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 20px" }}>{result.summary}</p>
              <ConfidenceMeter value={result.confidence} color={cfg.color} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {/* Key Findings */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", letterSpacing: "0.1em", marginBottom: 14 }}>KEY FINDINGS</h3>
                {result.key_findings?.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ color: cfg.color, fontSize: 13, marginTop: 2, flexShrink: 0 }}>▸</span>
                    <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.55 }}>{f}</p>
                  </div>
                ))}
              </div>

              {/* Red Flags & Sources */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.red_flags?.length > 0 && (
                  <div className="card" style={{ borderColor: "rgba(255,145,0,0.2)", background: "rgba(255,145,0,0.04)" }}>
                    <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff9100", letterSpacing: "0.1em", marginBottom: 12 }}>⚠ RED FLAGS</h3>
                    {result.red_flags.map((f, i) => (
                      <p key={i} style={{ fontSize: 12, color: "#cc8800", lineHeight: 1.5, marginBottom: 6 }}>• {f}</p>
                    ))}
                  </div>
                )}
                <div className="card">
                  <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", letterSpacing: "0.1em", marginBottom: 12 }}>SOURCES CHECKED</h3>
                  {result.sources_checked?.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#888" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advice */}
            {result.advice && (
              <div className="card" style={{ borderColor: "rgba(124,131,255,0.2)", background: "rgba(124,131,255,0.04)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <p style={{ fontSize: 14, color: "#9998cc", lineHeight: 1.6 }}><strong style={{ color: "#7c83ff" }}>Advice: </strong>{result.advice}</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#444", letterSpacing: "0.1em", marginBottom: 14 }}>RECENT CHECKS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.slice(1).map((h, i) => {
                const c = verdictConfig[h.verdict] || verdictConfig.UNVERIFIED;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 13, color: "#666" }}>{h.news}</span>
                    <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: c.color, flexShrink: 0, marginLeft: 16 }}>{c.icon} {h.verdict}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 48, fontSize: 12, color: "#333", fontFamily: "'Space Mono', monospace", lineHeight: 1.8 }}>
          POWERED BY AI + REAL-TIME WEB SEARCH<br />
          <span style={{ color: "#222" }}>Always verify critical information from primary sources</span>
        </p>
      </div>


    </div>
  );
}

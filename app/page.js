"use client";
import "../styles/globals.css";
import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hi! 👋 I’m ContextPilot’s demo. Ask me anything to see live streaming." }
  ]);
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: q })
    });
    if (!res.body) { setMsgs((m)=>[...m,{role:"assistant",content:"Stream error."}]); setBusy(false); return; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    const idx = msgs.length + 1;
    setMsgs((m)=>[...m, { role:"assistant", content:"" }]);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value);
      setMsgs((m)=> m.map((mm,i)=> i===idx ? { ...mm, content: acc } : mm));
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h1 style={{ margin:0 }}>ContextPilot <span className="badge">Live</span></h1>
        <a className="small" href="https://vercel.com" target="_blank" rel="noreferrer">Powered by Vercel</a>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <p className="muted" style={{ marginTop:0 }}>Type a question. You’ll see a smooth, token-by-token streamed answer (no API keys).</p>
        <div style={{ display:"flex", gap:8 }}>
          <input className="input" placeholder="Ask anything…" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=> e.key==="Enter" && ask()} />
          <button className="btn" onClick={ask} disabled={busy}>{busy ? "Thinking…" : "Ask"}</button>
        </div>
      </div>

      <div className="card chat" style={{ minHeight: 180 }}>
        {msgs.map((m, i)=> (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "ai"}`}>{m.content}</div>
        ))}
      </div>

      <div className="card" style={{ marginTop:12 }}>
        <div className="muted small" style={{ marginBottom:6 }}>Citations</div>
        <div className="small">
          • <a href="https://en.wikipedia.org/wiki/Retrieval-augmented_generation" target="_blank" rel="noreferrer">RAG Overview</a> (p.1)<br/>
          • <a href="https://nextjs.org/docs" target="_blank" rel="noreferrer">Next.js Docs</a> (p.2)<br/>
          • <a href="https://github.com/pgvector/pgvector" target="_blank" rel="noreferrer">pgvector</a> (p.3)
        </div>
      </div>
    </div>
  );
}

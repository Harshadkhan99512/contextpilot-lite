"use client";
import "../../styles/globals.css";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ margin: 0 }}>Dashboard</h1>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="muted small" style={{ marginBottom: 6 }}>
          Recent messages (saved in your browser via secure cookie)
        </div>
        <div className="small" style={{ display: "grid", gap: 8 }}>
          {messages.length ? (
            [...messages].reverse().map((m) => (
              <div key={m.id} style={{ borderBottom: "1px solid #1f2937", paddingBottom: 8 }}>
                <b>{m.role}</b> — {new Date(m.createdAt).toLocaleString()}
                <br />
                {m.content}
              </div>
            ))
          ) : (
            <em>No messages yet — go to home and ask a question.</em>
          )}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <a href="/" className="btn" style={{ padding: "8px 12px" }}>Go to Chat</a>
      </div>
    </div>
  );
}

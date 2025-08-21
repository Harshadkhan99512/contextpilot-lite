export const runtime = "edge";

// Simple topic KB with keywords, dynamic bullets, and citations
const TOPICS = [
  {
    key: "overview",
    title: "ContextPilot Overview",
    keywords: ["contextpilot", "overview", "feature", "features", "product", "what is"],
    bullets: [
      "Multi-tenant AI workspace to chat with your documents (RAG) with orgs/roles.",
      "Hybrid retrieval: pgvector embeddings + Postgres keyword search (tsvector).",
      "Streamed answers with inline citations; clean, responsive UI.",
      "Stripe billing, usage tracking, API keys, webhooks, admin basics."
    ],
    tip: "Start with specific, factual questions to get focused answers.",
    cites: [
      { title: "Next.js Docs", url: "https://nextjs.org/docs" },
      { title: "pgvector", url: "https://github.com/pgvector/pgvector" }
    ]
  },
  {
    key: "rag",
    title: "RAG (Retrieval‑Augmented Generation)",
    keywords: ["rag", "retrieval", "chunk", "embed", "embedding", "vector", "pgvector", "similarity", "hybrid", "tsvector", "rerank", "cite", "citation", "document"],
    bullets: [
      "We parse PDFs, DOCX, HTML/URLs, then chunk 500–1000 tokens with ~80 overlap.",
      "Embeddings stored in pgvector (ivfflat index); keywords in tsvector for hybrid search.",
      "Top‑k vector hits merged with keyword matches; optional rerank; we return citations.",
      "Re‑index anytime; ingestion runs in the background with progress."
    ],
    tip: "Mention filenames/URLs or specific sections to improve retrieval relevance.",
    cites: [
      { title: "RAG Overview", url: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation", page: 1 },
      { title: "Postgres Full‑Text Search", url: "https://www.postgresql.org/docs/current/textsearch-intro.html" }
    ]
  },
  {
    key: "upload",
    title: "Document Ingestion & Uploads",
    keywords: ["upload", "uploads", "pdf", "docx", "url", "ingest", "uploader", "uploadthing", "s3", "r2", "reindex"],
    bullets: [
      "Upload PDFs/DOCX/TXT or add URLs; we parse + sanitize then chunk & embed.",
      "Storage via S3-compatible (R2/S3/MinIO local); 25–100MB per file (plan-based).",
      "Virus/type checks; background jobs update progress; reindex button available.",
      "Source metadata (doc_id, chunk_id, title, page, section) stored for citations."
    ],
    tip: "Prefer clean source files (selectable text PDFs) for higher-quality chunks.",
    cites: [
      { title: "UploadThing", url: "https://uploadthing.com" },
      { title: "Cloudflare R2", url: "https://developers.cloudflare.com/r2/" }
    ]
  },
  {
    key: "auth",
    title: "Auth & Orgs",
    keywords: ["auth", "login", "signin", "github", "google", "magic", "email", "resend", "org", "organization", "invite", "team", "members"],
    bullets: [
      "Auth.js (NextAuth): Google, GitHub, passwordless email (Resend).",
      "JWT sessions; roles per org (OWNER, ADMIN, MEMBER, BILLING).",
      "Invite members via tokenized links; switch orgs in the app header.",
      "API keys are org-scoped, hashed at rest; per-key rate limits."
    ],
    tip: "Use GitHub/Google for fastest onboarding; email magic link requires domain setup.",
    cites: [
      { title: "Auth.js", url: "https://authjs.dev" },
      { title: "Resend", url: "https://resend.com" }
    ]
  },
  {
    key: "pricing",
    title: "Pricing & Usage",
    keywords: ["price", "pricing", "plan", "starter", "pro", "token", "limit", "quota", "billing", "stripe", "invoice", "subscription"],
    bullets: [
      "Starter: 50k tokens/mo, 50 docs, 1 member; Pro: 1M tokens/mo, 500 docs, 10 members.",
      "Stripe subscriptions + customer portal; invoices tracked in-app.",
      "Usage events store tokens-in/out and USD cost; charts by day/week.",
      "Server‑side limits enforced with helpful errors when quota is hit."
    ],
    tip: "Set usage alerts and check daily charts to avoid surprises.",
    cites: [
      { title: "Stripe Billing", url: "https://stripe.com/billing" }
    ]
  },
  {
    key: "nextjs",
    title: "Next.js & Performance",
    keywords: ["next", "nextjs", "app router", "rsc", "server actions", "edge", "route", "handler", "streaming", "vercel ai sdk"],
    bullets: [
      "App Router with RSC; chat runs on Edge for low‑latency streaming.",
      "Heavy DB/webhooks stay on Node runtime; static marketing pages are cached.",
      "Zod validation, Sentry, PostHog, and pino for observability.",
      "Keyboard shortcuts, shadcn/ui, and accessible components (a11y)."
    ],
    tip: "Keep DB access off Edge; call Node API routes from Edge tools.",
    cites: [
      { title: "Next.js App Router", url: "https://nextjs.org/docs/app" }
    ]
  },
  {
    key: "security",
    title: "Security & Privacy",
    keywords: ["security", "privacy", "gdpr", "retention", "export", "delete", "csp", "rate", "limit", "csrf", "xss", "headers"],
    bullets: [
      "Security headers (CSP, referrer-policy, frame-ancestors none) added.",
      "PII/secret stripping on ingest (basic patterns) to reduce leakage risk.",
      "API keys hashed; logs pruned per retention; org-scoped auth checks.",
      "Per-IP and per-key rate limit via Upstash; file validation & size limits."
    ],
    tip: "Enable Sentry DSN and strict CSP in production for better safety nets.",
    cites: [
      { title: "OWASP Cheat Sheet", url: "https://cheatsheetseries.owasp.org/" }
    ]
  }
];

const GREETINGS = ["Salaam", "Assalam‑o‑Alaikum", "Hello", "Hey", "Hi"];
const HEADERS = ["Key points", "Highlights", "What matters", "Takeaways", "In short"];
const TIPS = ["Tip", "Pro tip", "Note", "Heads‑up", "FYI"];

function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function pick(arr, seed, salt = 0) {
  return arr[(seed + salt) % arr.length];
}
function score(query, keywords) {
  const q = query.toLowerCase();
  return keywords.reduce((acc, kw) => acc + (q.includes(kw) ? 1 : 0), 0);
}
function selectTopic(query) {
  let best = TOPICS[0]; // overview default
  let bestScore = 0;
  for (const t of TOPICS) {
    const s = score(query, t.keywords);
    if (s > bestScore) { best = t; bestScore = s; }
  }
  return best;
}

function formatAnswer(topic, prompt, seed) {
  const greet = pick(GREETINGS, seed, 1);
  const header = pick(HEADERS, seed, 2);
  const tipLabel = pick(TIPS, seed, 3);

  const bullets = topic.bullets.map(b => `• ${b}`).join("\n");
  const cites = topic.cites.map(c => `• ${c.title} — ${c.url}${c.page ? " (p." + c.page + ")" : ""}`).join("\n");

  return `${greet}! 👋 Ye ContextPilot demo hai.

You asked: "${prompt}"

${header} about ${topic.title}:
${bullets}

${tipLabel}: ${topic.tip}

Citations:
${cites}

Want fully AI‑generated answers? Add an OpenAI key later — demo abhi keys ke baghair chal raha hai.`;
}

// Stream helper
function* chunker(text, size = 14) {
  let i = 0;
  while (i < text.length) { yield text.slice(i, i + size); i += size; }
}

export async function POST(req) {
  const { prompt } = await req.json().catch(() => ({}));
  const q = (prompt || "Tell me about ContextPilot").slice(0, 300);
  const seed = hashSeed(q);
  const topic = selectTopic(q);
  const msg = formatAnswer(topic, q, seed);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const iter = chunker(msg);
      const iv = setInterval(() => {
        const next = iter.next();
        if (next.done) { clearInterval(iv); controller.close(); return; }
        controller.enqueue(encoder.encode(next.value));
      }, 35);
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
  });
}

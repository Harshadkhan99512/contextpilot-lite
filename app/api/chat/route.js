export const runtime = "edge";

function* chunker(text, size = 12) {
  let i = 0;
  while (i < text.length) {
    yield text.slice(i, i + size);
    i += size;
  }
}

export async function POST(req) {
  const { prompt } = await req.json().catch(() => ({}));
  const q = (prompt || "Tell me about ContextPilot").slice(0, 200);

  const msg = `Hello! 👋 This is the ContextPilot live demo.
We stream responses from an Edge Function without any API keys.
Your question: "${q}"

Key ideas:
• Multi-tenant AI workspace
• Chat with your documents (RAG)
• Fast streaming and clean UX

Next steps: Connect Postgres + Auth to unlock the full product.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const iter = chunker(msg);
      const iv = setInterval(() => {
        const next = iter.next();
        if (next.done) { clearInterval(iv); controller.close(); return; }
        controller.enqueue(encoder.encode(next.value));
      }, 40);
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
  });
}

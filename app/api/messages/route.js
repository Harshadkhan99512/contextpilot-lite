export const runtime = "edge";

function readCookie(req, name) {
  const c = req.headers.get("cookie") || "";
  const part = c.split(";").map(s => s.trim()).find(s => s.startsWith(name + "="));
  if (!part) return null;
  return part.split("=").slice(1).join("=");
}
function parseMsgs(val) {
  try { return JSON.parse(decodeURIComponent(val)); } catch { return []; }
}
function buildSetCookie(name, arr) {
  const val = encodeURIComponent(JSON.stringify(arr));
  // 7 days
  return `${name}=${val}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

export async function GET(req) {
  const val = readCookie(req, "msgs");
  const arr = val ? parseMsgs(val) : [];
  return new Response(JSON.stringify({ messages: arr }), {
    headers: { "content-type": "application/json" }
  });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const role = (body.role || "assistant").toString().slice(0, 12);
  const content = (body.content || "").toString().slice(0, 600);
  if (!content) {
    return new Response(JSON.stringify({ error: "Empty" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const prevVal = readCookie(req, "msgs");
  let arr = prevVal ? parseMsgs(prevVal) : [];
  arr.push({ id: Date.now(), role, content, createdAt: new Date().toISOString() });
  arr = arr.slice(-10); // keep last 10

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": buildSetCookie("msgs", arr)
    }
  });
}

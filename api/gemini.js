export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, service: "gemini", keyConfigured: !!process.env.GEMINI_API_KEY, model: "gemini-3.6-flash" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel." });
  const body = req.body || {};
  const model = body.model || "gemini-3.6-flash";
  const payload = { contents: body.contents || [] };
  if (body.jsonMode) payload.generationConfig = { responseMimeType: "application/json" };
  let lastStatus = 500;
  let lastMessage = "Gemini request failed";
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const text = await r.text();
      let data = {}; try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (r.ok) {
        const output = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
        if (!output) return res.status(502).json({ error: "Gemini returned no text output." });
        return res.status(200).json({ text: output });
      }
      lastStatus = r.status;
      lastMessage = data?.error?.message || `Gemini HTTP ${r.status}`;
      if (![429, 500, 502, 503, 504].includes(r.status)) break;
      await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
    } catch (e) {
      lastStatus = 504;
      lastMessage = e?.name === "AbortError" ? "Gemini request timed out." : (e?.message || "Gemini network error");
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
    } finally { clearTimeout(timer); }
  }
  return res.status(lastStatus).json({ error: `${lastMessage} (Gemini HTTP ${lastStatus})` });
}

// api/gemini.js
//
// Server-side Gemini proxy. The Gemini API key is read from the
// GEMINI_API_KEY environment variable on Vercel and is never sent to,
// or visible from, the browser.
//
// The frontend (app.js) POSTs { model, contents, jsonMode } here and
// gets back { text } or { error }.

const MAX_BODY_BYTES = 8 * 1024 * 1024; // generous for a couple of resized photos

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowList = allowedOrigins();

  if (allowList.length === 0) {
    // No allow-list configured (typical single-Vercel-project setup where
    // the frontend and this API share the same origin) — same-origin
    // browser requests don't need CORS headers at all, but we still set
    // this so the endpoint also works if you later split the frontend
    // off to e.g. GitHub Pages.
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin && allowList.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    res.status(413).json({ error: "Request too large" });
    return;
  }

  const model = body.model || "gemini-2.5-flash";
  const contents = body.contents;
  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: "Missing contents" });
    return;
  }

  const generationConfig = {};
  if (body.jsonMode) generationConfig.responseMimeType = "application/json";

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({ contents, generationConfig }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      const message =
        (data && data.error && data.error.message) ||
        `Gemini returned HTTP ${upstream.status}`;
      res.status(upstream.status).json({ error: message });
      return;
    }

    const text =
      (data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map((p) => p.text || "").join("")) ||
      "";

    res.status(200).json({ text });
  } catch (err) {
    res.status(502).json({ error: "Could not reach Gemini API" });
  }
};

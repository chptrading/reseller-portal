// Vercel serverless endpoint for Gemini API.
// Keep GEMINI_API_KEY in Vercel Environment Variables only.

const DEFAULT_MODEL = "gemini-3.6-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function send(res, status, body) {
  res.status(status).setHeader("Cache-Control", "no-store").json(body);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method === "GET") {
    return send(res, 200, {
      ok: true,
      service: "gemini",
      keyConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      model: DEFAULT_MODEL
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return send(res, 500, {
      error: "GEMINI_API_KEY is not configured in Vercel. Add it to Production and redeploy."
    });
  }

  try {
    const body = req.body || {};
    const model = String(body.model || DEFAULT_MODEL).replace(/^models\//, "");
    const contents = Array.isArray(body.contents) ? body.contents : [];

    if (!contents.length) {
      return send(res, 400, { error: "No Gemini contents were supplied." });
    }

    const payload = { contents };
    if (body.jsonMode) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`;

    let lastStatus = 503;
    let lastMessage = "Gemini service unavailable.";
    let lastResult = null;

    // 503/429 are transient according to Google's troubleshooting guidance.
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 50000);

      try {
        const geminiRes = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const raw = await geminiRes.text();
        let result;
        try { result = JSON.parse(raw); } catch { result = null; }

        if (geminiRes.ok) {
          const text = result?.candidates?.[0]?.content?.parts
            ?.filter((part) => typeof part.text === "string")
            ?.map((part) => part.text)
            ?.join("")
            ?.trim();

          if (!text) {
            const finishReason = result?.candidates?.[0]?.finishReason;
            return send(res, 502, {
              error: finishReason
                ? `Gemini returned no text (finish reason: ${finishReason}).`
                : "Gemini returned no text."
            });
          }
          return send(res, 200, { text });
        }

        lastStatus = geminiRes.status;
        lastResult = result;
        lastMessage = result?.error?.message || `Gemini returned HTTP ${geminiRes.status}.`;

        // Don't retry client/configuration errors.
        if (![408, 429, 500, 502, 503, 504].includes(geminiRes.status)) break;
      } catch (error) {
        lastStatus = 503;
        lastMessage = error?.name === "AbortError"
          ? "Gemini request timed out after 50 seconds."
          : `Could not reach Gemini: ${error?.message || "Unknown network error"}`;
      } finally {
        clearTimeout(timeout);
      }

      if (attempt < 2) await sleep(1000 * (2 ** attempt));
    }

    const apiStatus = lastResult?.error?.status ? ` (${lastResult.error.status})` : "";
    return send(res, lastStatus, {
      error: `Gemini API error${apiStatus}: ${lastMessage}`,
      model,
      attempts: 3
    });
  } catch (error) {
    console.error("Gemini server error:", error);
    return send(res, 500, {
      error: `Gemini server error: ${error?.message || "Unknown error"}`
    });
  }
}

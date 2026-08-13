// Vercel serverless endpoint for Gemini API
// The Gemini API key must stay in Vercel Environment Variables as GEMINI_API_KEY.
// Never put the key in app.js or expose it to the browser.

const DEFAULT_MODEL = "gemini-3.6-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function send(res, status, body) {
  res.status(status).setHeader("Cache-Control", "no-store").json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return send(res, 500, {
      error: "Gemini API key is not configured on Vercel. Add GEMINI_API_KEY to the Production environment, then redeploy."
    });
  }

  try {
    const body = req.body || {};
    const model = String(body.model || DEFAULT_MODEL).replace(/^models\//, "");
    const contents = Array.isArray(body.contents) ? body.contents : [];

    if (!contents.length) {
      return send(res, 400, { error: "No Gemini contents were supplied." });
    }

    // The browser sends jsonMode=true when it expects a JSON-only response.
    // Gemini's REST API uses generationConfig.responseMimeType for this.
    const payload = { contents };
    if (body.jsonMode) {
      payload.generationConfig = {
        responseMimeType: "application/json"
      };
    }

    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`;
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const raw = await geminiRes.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = null;
    }

    if (!geminiRes.ok) {
      const message = result?.error?.message || `Gemini returned HTTP ${geminiRes.status}.`;
      const reason = result?.error?.status ? ` (${result.error.status})` : "";
      return send(res, geminiRes.status, {
        error: `Gemini API error${reason}: ${message}`
      });
    }

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
  } catch (error) {
    console.error("Gemini server error:", error);
    return send(res, 500, {
      error: `Gemini server error: ${error?.message || "Unknown error"}`
    });
  }
}

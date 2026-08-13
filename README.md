# Reseller Portal

Static React app hosted from GitHub, using Firebase Authentication/Firestore and a small server-side Gemini API endpoint.

## Security change

The Gemini API key is **not stored in this repository** and is never sent to the browser.

The browser calls:

`https://YOUR-BACKEND.vercel.app/api/gemini`

The server-side function reads `GEMINI_API_KEY` from its deployment environment and calls Gemini with the `x-goog-api-key` header.

Google's current Gemini API documentation recommends server-side API-key handling; the current REST authentication uses the `x-goog-api-key` header.

## 1. Rotate the exposed Gemini key

The Gemini key that was previously present in the client code has been removed from this project. Because that key has been exposed, create/rotate a fresh key in Google AI Studio and use the new value only as a server-side environment variable.

Do **not** put the new value in `app.js`, GitHub, or this README.

## 2. Deploy the backend

This repository includes a Vercel serverless function at:

`api/gemini.js`

Deploy the repository to Vercel (you can connect the GitHub repository to Vercel).

In Vercel → Project → Settings → Environment Variables, add:

- Name: `GEMINI_API_KEY`
- Value: your newly rotated Gemini API key
- Environments: Production (and Preview if desired)

Redeploy after adding the variable.

## 3. Connect the frontend

After Vercel gives you a URL such as:

`https://reseller-portal-abc.vercel.app`

open `app.js` and change:

`const GEMINI_API_URL = "https://YOUR-BACKEND.vercel.app/api/gemini";`

to:

`const GEMINI_API_URL = "https://reseller-portal-abc.vercel.app/api/gemini";`

Commit and push that change to GitHub.

The URL is not a secret. The API key stays on Vercel.

### If you use GitHub Pages

You can keep the frontend on GitHub Pages and deploy only the `api/` backend to Vercel. The GitHub Pages site calls the Vercel endpoint.

In Vercel, set `ALLOWED_ORIGINS` to your GitHub Pages origin, for example:

`https://YOUR-USERNAME.github.io`

If you use a project page such as `https://YOUR-USERNAME.github.io/reseller-portal`, the origin is still `https://YOUR-USERNAME.github.io`.

## 4. Firebase

The Firebase web configuration in `app.js` is intentionally client-side. Firebase web API keys are identifiers rather than the same kind of secret as the Gemini API key; your Firestore Security Rules and Authentication configuration are what protect the data.

Keep the existing `firestore.rules` deployed.

## 5. What changed

- Removed the Gemini secret from `app.js`.
- Added a server-side `/api/gemini` endpoint.
- Switched Gemini authentication to the server-side `x-goog-api-key` header.
- Updated the model setting to `gemini-3.6-flash`.
- Kept the existing text + image request format and JSON-mode behaviour.
- Added CORS handling for browser requests.
- Added request-size and method checks.
- Added `.gitignore` so local secret files are not committed.

## Local development

Copy `.env.example` to `.env` and put your rotated Gemini key in `.env`.

Run:

`npm install`

Then:

`npm run dev`

For a local browser frontend, set `GEMINI_API_URL` in `app.js` to your local API URL or use the deployed Vercel URL.

Never commit `.env`.

## Important

Do not try to work around GitHub/Microsoft secret scanning. Keeping the key server-side is the correct fix: the repository can be public, while the credential remains private.

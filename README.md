# Reseller Portal

Static React app hosted on GitHub Pages, using Firebase Authentication and Cloud Firestore.

## Files

- `index.html` — page shell and CDN dependencies
- `app.js` — existing reseller portal app
- `firestore.rules` — only authenticated Firebase users can access the shared business document

## Firebase setup

1. Firebase Console → Authentication → Sign-in method → enable **Email/Password**.
2. Firebase Console → Authentication → Users → **Add user**. Create the first account.
3. Authentication → Settings → Authorized domains → add your GitHub Pages hostname, e.g. `YOUR-USERNAME.github.io`.
4. Firestore Database → Rules → paste the contents of `firestore.rules` and publish.

## GitHub Pages

Upload these files to the repository root. In GitHub, open Settings → Pages and choose the `main` branch as the publishing source. GitHub Pages will publish the repository as a static site.

## Important

The Gemini API key is intentionally left in the client code at the user's request. Any browser-exposed API key can be copied by visitors, so restrict/rotate it in the relevant provider console if it is ever abused.

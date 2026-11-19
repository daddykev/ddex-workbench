# DDEX Workbench Setup Guide

This guide sets up DDEX Workbench for local development.

## Prerequisites

- **Node.js 22+**: the app requires `>=22.12.0`, and the functions run on Node 22
- **Firebase CLI**: `npm install -g firebase-tools`
- **Java**: required by the Firestore and Auth emulators
- **Python 3.10+**: only if you work on the Python SDK
- **Git**, and a **Google account** for Firebase

## 1. Clone and install

```bash
git clone https://github.com/daddykev/ddex-workbench.git
cd ddex-workbench/ui

npm install                          # frontend
cd functions && npm install && cd .. # Cloud Functions
```

The app lives under `ui/`. **Run all Firebase commands from `ui/`**, where `firebase.json` is.

## 2. Firebase project

The repository already contains the Firebase configuration in `ui/firebase.json`, so don't run `firebase init`. It sets up:
- **Hosting**, serving `dist/` with SPA rewrites
- **Functions**, from `functions/`
- **Firestore**, using `firestore.rules` and `firestore.indexes.json`
- **Storage**, using `storage.rules`, which denies all access
- **Emulators**: Functions on port 5001, Firestore on 8080, Auth on 9099, and the Emulator UI

To use your own project:
1. Create a project in the [Firebase Console](https://console.firebase.google.com), and enable **Authentication** (Email/Password and Google) and **Firestore**.
2. Select the project (`.firebaserc` is gitignored):
   ```bash
   firebase login
   firebase use --add
   ```

## 3. Environment

```bash
cp .env.example .env
```

Fill in the web app config from Firebase Console → Project settings → Your apps:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

`VITE_API_BASE_URL` is optional and sets the API base URL that `ui/src/services/api.js` calls. When it's empty, the app uses `http://localhost:5001/ddex-workbench/us-central1/app` in development and `https://api.ddex-workbench.org/v1` in production builds. `ui/.env.production` sets it to `https://api.ddex-workbench.org/v1`, so builds go through the Cloudflare Worker. To point `npm run dev` at the Functions emulator explicitly:

```env
VITE_API_BASE_URL=http://127.0.0.1:5001/ddex-workbench/us-central1/app
```

## 4. Schemas and validation rules

Validation needs two gitignored inputs in `ui/functions/`.

**XSD schemas:**

```bash
cd functions
npm run schemas:download      # writes schemas/ern/<version>/
npm run schemas:download -- --dry-run   # list what would be fetched
cd ..
```

DDEX no longer serves the ERN 3.8.2 schema, so that version fails to download. The script leaves any existing `schemas/ern/3.8.2/` in place, so keep a copy of it.

**Validation rules:** the rule modules `functions/validators/rules/schematron-382.js`, `schematron-42.js` and `schematron-43.js` are private and not part of the repository. Copy them in if you have them. Without them, the function logs a startup error, `POST /validate` returns `503 VALIDATION_RULES_UNAVAILABLE`, and every other endpoint (`/health`, `/formats`, `/keys`, `/deezer/*`) keeps working.

## 5. Run locally

In one terminal, from `ui/`, start the emulators:

```bash
firebase emulators:start --only functions,firestore,auth --project ddex-workbench
```

- **Functions:** `http://127.0.0.1:5001/ddex-workbench/us-central1/app`
- **Firestore:** `127.0.0.1:8080`
- **Auth:** `127.0.0.1:9099`
- **Emulator UI:** the URL printed at startup

`--project ddex-workbench` makes the Functions URL match the development URL in `ui/src/services/api.js`. With another project ID, the function is served under that ID instead. In the emulated function, the Admin SDK uses the Firestore and Auth emulators.

In a second terminal, from `ui/`:

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The web app doesn't connect to the emulators itself: sign-in, snippets and profiles use the Firebase project in your `.env`, and API calls go to the Functions emulator.

To run only the Functions emulator, use `cd functions && npm run serve`.

Check the API:

```bash
curl http://127.0.0.1:5001/ddex-workbench/us-central1/app/health

curl -X POST -H "Content-Type: application/xml" --data-binary @release.xml \
  "http://127.0.0.1:5001/ddex-workbench/us-central1/app/validate?version=4.3&profile=AudioAlbum"
```

## npm scripts

| Location | Script | What it does |
|---|---|---|
| `ui/` | `npm run dev` | Vite dev server |
| | `npm run build` | Production build into `ui/dist` |
| | `npm run preview` | Serve the production build locally |
| `ui/functions/` | `npm run serve` | Functions emulator only |
| | `npm run shell` / `npm start` | Functions shell |
| | `npm run deploy` | `firebase deploy --only functions` |
| | `npm run logs` | `firebase functions:log` |
| | `npm run schemas:download` | Download the DDEX XSDs |
| `ui/packages/sdk/` | `npm run build` / `npm run dev` | tsup build, or watch mode |
| | `npm test` / `npm run test:coverage` | vitest |

There is no test or lint script for the app or the functions.

## Where things live

| Task | Location |
|---|---|
| API routes | `ui/functions/api/` (`validate.js`, `keys.js`, `deezer.js`), mounted in `ui/functions/index.js` |
| Auth and rate-limit middleware | `ui/functions/middleware/` |
| Validators | `ui/functions/validators/` |
| Frontend API client | `ui/src/services/api.js` |
| Pages and routes | `ui/src/views/`, `ui/src/router/index.js` |
| Styles and themes | `ui/src/assets/` (`themes.css` holds the design tokens) |
| API reference page | `ui/src/views/ApiDocsView.vue` (served at `/api`) |
| API edge proxy | `cloudflare/worker.js` (at the repository root) |

### Adding an API endpoint

1. Add an Express router in `ui/functions/api/`.
2. Mount it in `ui/functions/index.js` under both `/<name>` and `/api/<name>`. Add `validationGuards` if it should be rate limited.
3. Call it from `ui/src/services/api.js`.
4. Document it in `ui/src/views/ApiDocsView.vue`.

## Troubleshooting

- **Emulator ports in use:** `lsof -ti:5001,8080,9099 | xargs kill -9`
- **`/validate` returns 503:** the rule modules are missing from `ui/functions/validators/rules/`.
- **XSD errors about missing schema files:** run `npm run schemas:download` in `ui/functions`, and restore `schemas/ern/3.8.2/` from a backup.
- **Auth problems in development:** check the `.env` values, and that the project allows sign-in from `localhost`.
- **Build errors:** delete `node_modules` and `package-lock.json`, then run `npm install` again.

## Deployment

See [Deployment in the blueprint](blueprint.md#deployment). In short: when `cloudflare/worker.js` changes, paste its full contents into the Cloudflare dashboard (Workers & Pages → `ddex-api-proxy` → Edit code → Deploy). The file in the repository is the source of truth, and the Worker's attachment to `api.ddex-workbench.org` is configured in the dashboard. Then, from `ui/`, run `firebase deploy --only functions`, then `npm run build && firebase deploy --only hosting`.

## Resources

- [Technical blueprint](blueprint.md)
- [API reference](https://ddex-workbench.org/api)
- [DDEX Knowledge Base](https://kb.ddex.net/)
- [Vue 3](https://vuejs.org/) and [Firebase](https://firebase.google.com/docs) documentation

## Need help?

Open an issue on [GitHub Issues](https://github.com/daddykev/ddex-workbench/issues), or email daddykev@gmail.com.

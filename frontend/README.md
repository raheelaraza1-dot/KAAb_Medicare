# CAB Medicare frontend

React + Vite clinic UI. Deploy this folder on Netlify. Keep the API (`server/`) on a separate host.

## Local development

From the repository root:

```bash
pnpm api:dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The UI runs on `http://localhost:3000` so it matches the backend `CORS_ORIGIN` default. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the root `.env`.

## Environment

Copy `.env.example` to `.env`:

```
VITE_API_URL=http://localhost:4000
```

On Netlify, set `VITE_API_URL` to your public API URL (for example `https://api.example.com`) and rebuild.

On the API host, set `CORS_ORIGIN` to the Netlify site URL (environment variable only — no backend code change).

## Build

```bash
cd frontend
npm run build
```

Netlify: base directory `frontend`, publish `dist`, build command `npm run build`. `netlify.toml` already includes SPA redirects.

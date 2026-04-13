# Hybrid Notes Desktop

Electron companion app for `azuret.me` that:

- opens the Hybrid Notes web app in a desktop window
- runs a local helper on `http://127.0.0.1:4317`
- lets the web app import Microsoft Edge tabs from the same Windows PC
- can open the same synced workspace as the browser by using the same sync key

## Commands

Development:

```bash
npm run electron:dev
```

Production-style desktop shell:

```bash
npm run electron
```

By default, `npm run electron` opens:

```text
https://azuret.me/h
```

If you want to point Electron at a local dev server instead, start it through:

```bash
npm run electron:dev
```

If you want Electron to open a specific shared workspace, set `ELECTRON_SYNC_KEY` first:

```powershell
$env:ELECTRON_SYNC_KEY="atelier-demo-1234"
npm run electron
```

The browser app and Electron app will show the same notes when they use the same sync key or copied sync link.

## Helper API

Health check:

```text
GET http://127.0.0.1:4317/health
```

Edge tabs:

```text
GET http://127.0.0.1:4317/api/edge-tabs
```

The Hybrid Notes web UI tries this helper first, then falls back to the app route.

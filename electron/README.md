# Hybrid Notes Desktop

Electron-first desktop app for analog + digital note workflows.

## What changed

- the web page is now a product showcase and download surface
- the actual experience lives in the Electron app
- the desktop app stores notes locally and can import Microsoft Edge tabs through the local helper
- an Edge extension can push the active tab to the helper in real time

## Commands

Development run:

```bash
npm run electron:dev
```

Regular desktop run:

```bash
npm run electron
```

## Desktop features

- dashboard with paper inbox, digital shelf, and bridge coverage
- analog capture and digital note creation
- Microsoft Edge tab import from the same Windows machine
- live active-tab import through the Edge extension
- bridge links between paper notes and digital notes
- ritual checklist, JSON export, JSON import, and local reset

## Helper API

The Electron process starts a local helper automatically:

```text
GET http://127.0.0.1:4317/health
GET http://127.0.0.1:4317/api/edge-tabs
```

The desktop renderer uses that helper to read Edge tabs locally.

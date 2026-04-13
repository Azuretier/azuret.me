# Hybrid Notes Live Bridge

Microsoft Edge extension for real-time active-tab capture.

## What it does

- watches the active Microsoft Edge tab
- sends the current tab title and URL to `http://127.0.0.1:4317/api/edge-extension-tabs`
- lets Hybrid Notes Desktop import the real active tab instead of relying only on session snapshots

## Load it in Edge

1. Open `edge://extensions`
2. Turn on `Developer mode`
3. Click `Load unpacked`
4. Select the `extensions/hybrid-notes-edge` folder

## Notes

- keep Hybrid Notes Desktop running while using the extension
- `Auto send` pushes the active tab when you switch tabs or when the page finishes loading
- `Send current window` batches all supported tabs from the current window

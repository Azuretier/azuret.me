const HELPER_ENDPOINTS = [
  'http://127.0.0.1:4317/api/edge-extension-tabs',
  'http://localhost:4317/api/edge-extension-tabs',
]

const STORAGE_DEFAULTS = {
  autoSend: true,
  lastSentAt: '',
  lastSentTitle: '',
  lastSentUrl: '',
  lastReason: '',
  lastError: '',
  lastStatus: 'idle',
}

let lastPushFingerprint = ''
let lastPushAt = 0

function isSupportedUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('edge://'))
}

function fingerprintTab(tab) {
  return `${tab.windowId || 'w'}:${tab.id || 't'}:${tab.url || ''}:${tab.title || ''}`
}

function shouldSkipPush(tab) {
  const fingerprint = fingerprintTab(tab)
  const now = Date.now()
  if (fingerprint === lastPushFingerprint && now - lastPushAt < 1200) return true
  lastPushFingerprint = fingerprint
  lastPushAt = now
  return false
}

async function updateStatus(patch) {
  await chrome.storage.local.set({ ...patch })
}

async function getSettings() {
  return chrome.storage.local.get(STORAGE_DEFAULTS)
}

function makePayload(tab, reason) {
  return {
    id: `extension-${tab.windowId || 'w'}-${tab.id || 't'}`,
    title: tab.title || tab.url || 'Untitled tab',
    url: tab.url || '',
    windowId: typeof tab.windowId === 'number' ? tab.windowId : null,
    tabId: typeof tab.id === 'number' ? tab.id : null,
    faviconUrl: tab.favIconUrl || '',
    reason,
    capturedAt: new Date().toISOString(),
  }
}

async function postToHelper(payload) {
  let lastError = 'Helper is not running.'

  for (const endpoint of HELPER_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.error) {
        lastError = data.error || `Helper responded with ${response.status}`
        continue
      }

      await updateStatus({
        lastStatus: 'connected',
        lastError: '',
        lastSentAt: payload.capturedAt,
        lastSentTitle: payload.title,
        lastSentUrl: payload.url,
        lastReason: payload.reason,
      })

      return { ok: true }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Failed to reach helper.'
    }
  }

  await updateStatus({
    lastStatus: 'disconnected',
    lastError,
  })

  return { ok: false, error: lastError }
}

async function pushTab(tab, reason) {
  if (!tab || !isSupportedUrl(tab.url)) return { ok: false, error: 'Unsupported tab URL.' }
  if (!tab.title) return { ok: false, error: 'Tab title is not available yet.' }
  if (shouldSkipPush(tab)) return { ok: true, skipped: true }
  return postToHelper(makePayload(tab, reason))
}

async function pushActiveTab(reason) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  return pushTab(tab, reason)
}

async function pushCurrentWindowTabs(reason) {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const supportedTabs = tabs.filter((tab) => isSupportedUrl(tab.url) && tab.title)

  if (supportedTabs.length === 0) {
    await updateStatus({
      lastError: 'No supported tabs were found in the current window.',
    })
    return { ok: false, error: 'No supported tabs were found.' }
  }

  for (const tab of supportedTabs) {
    await postToHelper(makePayload(tab, reason))
  }

  return { ok: true, count: supportedTabs.length }
}

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.get(STORAGE_DEFAULTS).then(async (current) => {
    await chrome.storage.local.set(current)
    if (current.autoSend) await pushActiveTab('installed')
  })
})

chrome.runtime.onStartup.addListener(() => {
  void getSettings().then(async (settings) => {
    if (settings.autoSend) await pushActiveTab('startup')
  })
})

chrome.tabs.onActivated.addListener(async () => {
  const settings = await getSettings()
  if (!settings.autoSend) return
  await pushActiveTab('activated')
})

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (!tab.active) return
  if (changeInfo.status !== 'complete' && typeof changeInfo.title !== 'string') return

  const settings = await getSettings()
  if (!settings.autoSend) return
  await pushTab(tab, changeInfo.status === 'complete' ? 'updated' : 'title-change')
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'SEND_ACTIVE_TAB') {
    void pushActiveTab('manual').then(sendResponse)
    return true
  }

  if (message?.type === 'SEND_WINDOW_TABS') {
    void pushCurrentWindowTabs('window-batch').then(sendResponse)
    return true
  }

  if (message?.type === 'GET_STATUS') {
    void getSettings().then(sendResponse)
    return true
  }

  return false
})

const helperStatus = document.querySelector('#helper-status')
const autoSendToggle = document.querySelector('#auto-send')
const sendActiveButton = document.querySelector('#send-active')
const sendWindowButton = document.querySelector('#send-window')
const lastTitle = document.querySelector('#last-title')
const lastMeta = document.querySelector('#last-meta')
const lastError = document.querySelector('#last-error')

async function checkHelper() {
  const endpoints = ['http://127.0.0.1:4317/health', 'http://localhost:4317/health']

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: 'no-store' })
      if (!response.ok) continue
      helperStatus.textContent = 'Connected'
      helperStatus.style.color = '#0f766e'
      return
    } catch {
      // try next endpoint
    }
  }

  helperStatus.textContent = 'Offline'
  helperStatus.style.color = '#c2410c'
}

async function refreshStatus() {
  const status = await chrome.runtime.sendMessage({ type: 'GET_STATUS' })
  autoSendToggle.checked = Boolean(status?.autoSend)
  lastTitle.textContent = status?.lastSentTitle || 'Nothing sent yet'

  if (status?.lastSentAt) {
    const pretty = new Date(status.lastSentAt).toLocaleString()
    lastMeta.textContent = `${pretty}${status.lastReason ? ` • ${status.lastReason}` : ''}`
  } else {
    lastMeta.textContent = 'Install Hybrid Notes Desktop and keep it running.'
  }

  lastError.textContent = status?.lastError || 'No errors.'
}

async function setButtonsDisabled(next) {
  sendActiveButton.disabled = next
  sendWindowButton.disabled = next
}

sendActiveButton.addEventListener('click', async () => {
  await setButtonsDisabled(true)
  await chrome.runtime.sendMessage({ type: 'SEND_ACTIVE_TAB' })
  await refreshStatus()
  await checkHelper()
  await setButtonsDisabled(false)
})

sendWindowButton.addEventListener('click', async () => {
  await setButtonsDisabled(true)
  await chrome.runtime.sendMessage({ type: 'SEND_WINDOW_TABS' })
  await refreshStatus()
  await checkHelper()
  await setButtonsDisabled(false)
})

autoSendToggle.addEventListener('change', async () => {
  await chrome.storage.local.set({ autoSend: autoSendToggle.checked })
  await refreshStatus()
})

void refreshStatus()
void checkHelper()

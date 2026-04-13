const { app, BrowserWindow, shell } = require('electron')
const { startHelperServer, HELPER_PORT } = require('./helper-server.cjs')

let mainWindow = null
let helper = null

function getStartUrl() {
  const startUrl = process.env.ELECTRON_START_URL || 'https://azuret.me/h'
  const syncKey = (process.env.ELECTRON_SYNC_KEY || '').trim()

  if (!syncKey) return startUrl

  const url = new URL(startUrl)
  url.searchParams.set('sync', syncKey)
  return url.toString()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    title: 'Hybrid Notes Desktop',
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.loadURL(getStartUrl())
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  helper = await startHelperServer()
  createWindow()
  app.setAppUserModelId('azuret.me.hybrid-notes')
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async () => {
  if (helper) {
    try {
      await helper.close()
    } catch {
      // ignore close errors
    }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

process.env.ELECTRON_HELPER_PORT = String(HELPER_PORT)

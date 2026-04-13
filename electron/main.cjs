const path = require('node:path')
const { app, BrowserWindow, shell } = require('electron')
const { startHelperServer } = require('./helper-server.cjs')

let mainWindow = null
let helper = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1220,
    minHeight: 780,
    title: 'Hybrid Notes Desktop',
    backgroundColor: '#f5efe6',
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

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  helper = await startHelperServer()
  createWindow()
  app.setAppUserModelId('azuret.me.hybrid-notes.desktop')

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async () => {
  if (!helper) return

  try {
    await helper.close()
  } catch {
    // ignore close errors
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

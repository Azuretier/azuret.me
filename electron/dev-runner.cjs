const http = require('node:http')
const path = require('node:path')
const { spawn } = require('node:child_process')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const electronCmd = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron',
)

function waitForUrl(url, timeoutMs = 120000) {
  const started = Date.now()

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const request = http.get(url, (response) => {
        response.resume()
        resolve()
      })

      request.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`))
          return
        }

        setTimeout(tryConnect, 1200)
      })
    }

    tryConnect()
  })
}

async function main() {
  const web = spawn(npmCmd, ['run', 'dev'], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })

  let electron = null

  const shutdown = () => {
    if (electron && !electron.killed) electron.kill()
    if (!web.killed) web.kill()
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  try {
    await waitForUrl('http://127.0.0.1:3000/h')

    electron = spawn(electronCmd, ['.'], {
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        ELECTRON_START_URL: 'http://127.0.0.1:3000/h',
      },
    })

    electron.on('exit', (code) => {
      if (!web.killed) web.kill()
      process.exit(code ?? 0)
    })

    web.on('exit', (code) => {
      if (electron && !electron.killed) electron.kill()
      process.exit(code ?? 0)
    })
  } catch (error) {
    shutdown()
    throw error
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

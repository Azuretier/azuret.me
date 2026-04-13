const path = require('node:path')
const { spawn } = require('node:child_process')

const electronCmd = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron',
)

const child = spawn(electronCmd, ['.'], {
  stdio: 'inherit',
  shell: false,
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

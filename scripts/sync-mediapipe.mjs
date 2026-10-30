/**
 * MediaPipe Hands loads its WASM runtime and .tflite models through `locateFile`
 * at runtime. This script copies those files from node_modules into public/
 * before dev and build, so the finished site is fully self-hosted:
 * no CDN, no Python server, no extra request outside this static bundle.
 *
 * Run manually: npm run sync:mediapipe
 */
import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const targetDir = join(projectRoot, 'public', 'mediapipe')

let packageJsonPath
try {
  packageJsonPath = require.resolve('@mediapipe/hands/package.json')
} catch {
  console.error(
    '\n[mediapipe] 未找到 @mediapipe/hands，请先运行 `npm install` / `pnpm install`。\n',
  )
  process.exit(1)
}

const sourceDir = dirname(packageJsonPath)
const allowed = /\.(?:js|wasm|data|tflite|binarypb)$/i

try {
  const entries = await readdir(sourceDir, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile() && allowed.test(entry.name))
    .map((entry) => entry.name)

  if (!files.length) {
    throw new Error(`No MediaPipe runtime files found in ${sourceDir}`)
  }

  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })

  let totalBytes = 0
  for (const file of files) {
    const from = join(sourceDir, file)
    const to = join(targetDir, file)
    await cp(from, to)
    totalBytes += (await stat(from)).size
  }

  console.log(
    `[mediapipe] copied ${files.length} runtime files (${(totalBytes / 1024 / 1024).toFixed(1)} MB) -> public/mediapipe/`,
  )
} catch (error) {
  console.error('\n[mediapipe] 复制运行文件失败：', error.message, '\n')
  process.exit(1)
}

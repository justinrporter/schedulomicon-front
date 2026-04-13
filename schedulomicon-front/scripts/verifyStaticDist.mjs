import { existsSync, readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(appRoot, 'dist')
const indexHtmlPath = join(distDir, 'index.html')

const fail = (message) => {
  throw new Error(`Static hosting verification failed: ${message}`)
}

if (!existsSync(distDir)) {
  fail(`expected build output at ${distDir}; run "npm run build" first`)
}

if (!existsSync(indexHtmlPath)) {
  fail('dist/index.html is missing')
}

const indexHtml = readFileSync(indexHtmlPath, 'utf8')

if (indexHtml.includes('<base href="/">')) {
  fail('index.html contains a root-relative <base> tag, which breaks project-site hosting')
}

const refs = [...indexHtml.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1])
const localRefs = refs.filter(
  (ref) =>
    !ref.startsWith('http://') &&
    !ref.startsWith('https://') &&
    !ref.startsWith('mailto:') &&
    !ref.startsWith('data:') &&
    !ref.startsWith('#'),
)

if (localRefs.length === 0) {
  fail('index.html does not reference any local assets')
}

for (const ref of localRefs) {
  if (ref.startsWith('/')) {
    fail(`found root-relative asset reference "${ref}"`)
  }

  const targetPath = join(distDir, ref)

  if (!existsSync(targetPath)) {
    fail(`asset reference "${ref}" does not exist in dist/`)
  }
}

const assetsDir = join(distDir, 'assets')

if (!existsSync(assetsDir)) {
  fail('dist/assets is missing')
}

const assetEntries = await readdir(assetsDir)
const hasJavaScript = assetEntries.some((entry) => entry.endsWith('.js'))
const hasStylesheet = assetEntries.some((entry) => entry.endsWith('.css'))

if (!hasJavaScript) {
  fail('dist/assets does not contain a JavaScript bundle')
}

if (!hasStylesheet) {
  fail('dist/assets does not contain a stylesheet bundle')
}

console.log(
  `Verified ${localRefs.length} local asset reference(s) for static hosting in ${distDir}.`,
)

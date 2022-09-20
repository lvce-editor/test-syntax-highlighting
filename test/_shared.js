import { execaNode } from 'execa'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')

const binPath = join(root, 'bin', 'testSyntaxHighlighting.js')

export const testSample = async (name) => {
  const samplePath = join(root, 'test', 'fixtures', name)
  const { stdout, stderr, exitCode } = await execaNode(binPath, {
    cwd: samplePath,
    reject: false,
  })
  return {
    stdout,
    stderr,
    exitCode,
  }
}

import { execaNode } from 'execa'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')

const binPath = join(root, 'bin', 'testSyntaxHighlighting.js')

const testSample = async (name) => {
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

test('sample.error-extension-manifest-invalid-json', async () => {
  const result = await testSample(
    'sample.error-extension-manifest-invalid-json'
  )
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(`undefined:1
[;
 ^

SyntaxError: Unexpected token ; in JSON at position 1
    at JSON.parse `)
})

test('sample.error-no-languages', async () => {
  const result = await testSample('sample.error-no-languages')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(`no languages found in extension manifest`)
})

test('sample.error-language-without-tokenize-path', async () => {
  const result = await testSample('sample.error-language-without-tokenize-path')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(`no tokenize path found in extension manifest`)
})

test.skip('sample.basic-tokenize-function', async () => {
  const result = await testSample('sample.basic-tokenize-function')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toBe(``)
})

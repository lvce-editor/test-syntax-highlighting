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

test('sample.error-tokenize-path-not-found', async () => {
  const result = await testSample('sample.error-tokenize-path-not-found')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(`node:internal/errors:466
    ErrorCaptureStackTrace(err);
    ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module `)
})

test('sample.no-test-cases', async () => {
  const result = await testSample('sample.no-test-cases')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toBe(`no test cases found`)
})

test('sample.error-one-test-fails', async () => {
  const result = await testSample('sample.error-one-test-fails')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(`1 test failed, 0 tests passed`)
  expect(result.stderr).toBe(`mismatch comment `)
})

test('sample.error-tokenize-line-is-not-a-function', async () => {
  const result = await testSample(
    'sample.error-tokenize-line-is-not-a-function'
  )
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(`1 test failed, 0 tests passed`)
  expect(result.stderr).toBe(
    `tokenization failed for comment: Tokenizer.tokenizeLine is not a function`
  )
})

test.skip('sample.basic-tokenize-function', async () => {
  const result = await testSample('sample.basic-tokenize-function')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toBe(``)
})

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
  expect(result.stderr.replaceAll('\r\n', '\n')).toMatch(`undefined:1
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
  expect(result.stderr).toMatch(
    /Error \[ERR_MODULE_NOT_FOUND\]: Cannot find module .*tokenizeDotenv\.js/
  )
})

test('sample.error-no-test-cases', async () => {
  const result = await testSample('sample.error-no-test-cases')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toBe(`no test cases found`)
})

test('sample.error-one-test-fails', async () => {
  const result = await testSample('sample.error-one-test-fails')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(`1 test failed, 0 tests passed`)
  expect(result.stderr).toBe(`mismatch comment`)
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

test('sample.error-some-tests-pass-some-fail', async () => {
  const result = await testSample('sample.error-some-tests-pass-some-fail')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toMatch(
    /2 tests failed, 2 tests passed in \d+(\.\d+)?ms/
  )
  expect(result.stderr).toBe(
    `mismatch comment-2
mismatch comment-3`
  )
})

test('sample.basic-tokenize-function', async () => {
  const result = await testSample('sample.basic-tokenize-function')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  expect(result.stderr).toBe(``)
})

test('sample.one-test-skipped', async () => {
  const result = await testSample('sample.one-test-skipped')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(
    /1 test skipped, 0 tests passed in \d+(\.\d+)?ms/
  )
  expect(result.stderr).toBe(``)
})

// TODO test when baselines folder doesn't exist

test('sample.windows-line-endings', async () => {
  const result = await testSample('sample.windows-line-endings')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  expect(result.stderr).toBe(``)
})

test('sample.error-tokenize-string-value-missing', async () => {
  const result = await testSample('sample.error-tokenize-string-value-missing')
  expect(result.exitCode).toBe(1)
  expect(result.stderr).toBe(
    `tokenization failed for comment: TokenMap is missing property \"1\"`
  )
})

test('sample.error-token-map-missing', async () => {
  const result = await testSample('sample.error-token-map-missing')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  expect(result.stderr).toBe(
    'tokenization failed for comment: tokenizer is missing export const TokenMap'
  )
})

test('sample.with-flat-array-return', async () => {
  const result = await testSample('sample.with-flat-array-return')
  expect(result.exitCode).toBe(0)
  expect(result.stderr).toBe('')
})

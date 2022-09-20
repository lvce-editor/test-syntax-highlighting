import { testSample } from './_shared.js'

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

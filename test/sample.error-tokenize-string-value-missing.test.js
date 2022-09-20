import { testSample } from './_shared.js'

test('sample.error-tokenize-string-value-missing', async () => {
  const result = await testSample('sample.error-tokenize-string-value-missing')
  expect(result.exitCode).toBe(1)
  expect(result.stderr).toBe(
    `tokenization failed for comment: TokenMap is missing property \"1\"`
  )
})

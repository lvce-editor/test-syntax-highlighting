import { testSample } from './_shared.js'

test('sample.error-token-map-missing', async () => {
  const result = await testSample('sample.error-token-map-missing')
  expect(result.exitCode).toBe(1)
  expect(result.stderr).toBe(
    'tokenization failed for comment: tokenizer is missing export const TokenMap'
  )
})

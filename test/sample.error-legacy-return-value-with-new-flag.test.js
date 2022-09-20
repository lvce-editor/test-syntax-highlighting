import { testSample } from './_shared.js'

test('sample.error-legacy-return-value-with-new-flag', async () => {
  const result = await testSample(
    'sample.error-legacy-return-value-with-new-flag'
  )
  expect(result.exitCode).toBe(1)
  expect(result.stderr).toBe(
    'tokenization failed for comment: token must be of type number, but was of type object'
  )
})

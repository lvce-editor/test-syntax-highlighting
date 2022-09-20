import { testSample } from './_shared.js'

test('sample.error-tokenize-path-not-found', async () => {
  const result = await testSample('sample.error-tokenize-path-not-found')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(
    /Error \[ERR_MODULE_NOT_FOUND\]: Cannot find module .*tokenizeDotenv\.js/
  )
})

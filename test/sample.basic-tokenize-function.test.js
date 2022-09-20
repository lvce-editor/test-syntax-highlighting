import { testSample } from './_shared.js'

test('sample.basic-tokenize-function', async () => {
  const result = await testSample('sample.basic-tokenize-function')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  expect(result.stderr).toBe(``)
})

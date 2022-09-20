import { testSample } from './_shared.js'

test('sample.with-flat-array-return', async () => {
  const result = await testSample('sample.with-flat-array-return')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  expect(result.stderr).toBe('')
})

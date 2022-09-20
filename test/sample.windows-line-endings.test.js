import { testSample } from './_shared.js'

test('sample.windows-line-endings', async () => {
  const result = await testSample('sample.windows-line-endings')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  expect(result.stderr).toBe(``)
})

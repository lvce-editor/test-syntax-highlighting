import { testSample } from './_shared.js'

test('sample.error-one-test-fails', async () => {
  const result = await testSample('sample.error-one-test-fails')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(`1 test failed, 0 tests passed`)
  expect(result.stderr).toBe(`mismatch comment`)
})

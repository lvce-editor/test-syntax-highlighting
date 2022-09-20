import { testSample } from './_shared.js'

test('sample.error-no-test-cases', async () => {
  const result = await testSample('sample.error-no-test-cases')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toBe(`no test cases found`)
})

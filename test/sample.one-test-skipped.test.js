import { testSample } from './_shared.js'

test('sample.one-test-skipped', async () => {
  const result = await testSample('sample.one-test-skipped')
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(
    /1 test skipped, 0 tests passed in \d+(\.\d+)?ms/
  )
  expect(result.stderr).toBe(``)
})

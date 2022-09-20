import { testSample } from './_shared.js'

test('sample.error-some-tests-pass-some-fail', async () => {
  const result = await testSample('sample.error-some-tests-pass-some-fail')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toMatch(
    /2 tests failed, 2 tests passed in \d+(\.\d+)?ms/
  )
  expect(result.stderr).toBe(
    `mismatch comment-2
mismatch comment-3`
  )
})

import { testSample } from './_shared.js'

test('sample.error-no-languages', async () => {
  const result = await testSample('sample.error-no-languages')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(`no languages found in extension manifest`)
})

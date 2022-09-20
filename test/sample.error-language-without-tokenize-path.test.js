import { testSample } from './_shared.js'

test('sample.error-language-without-tokenize-path', async () => {
  const result = await testSample('sample.error-language-without-tokenize-path')
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr).toMatch(`no tokenize path found in extension manifest`)
})

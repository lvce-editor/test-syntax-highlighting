import { testSample } from './_shared.js'

test('sample.error-extension-manifest-invalid-json', async () => {
  const result = await testSample(
    'sample.error-extension-manifest-invalid-json'
  )
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr.replaceAll('\r\n', '\n')).toMatch(`undefined:1
[;
 ^

SyntaxError: Unexpected token ; in JSON at position 1
    at JSON.parse `)
})

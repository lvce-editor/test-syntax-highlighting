import { testSample } from './_shared.js'

test('sample.error-extension-manifest-invalid-json', async () => {
  const result = await testSample(
    'sample.error-extension-manifest-invalid-json',
  )
  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe(``)
  expect(result.stderr.replaceAll('\r\n', '\n')).toMatch(`<anonymous_script>:1
[;
 ^

SyntaxError: Unexpected token ';', \"[;\" is not valid JSON
    at JSON.parse `)
})

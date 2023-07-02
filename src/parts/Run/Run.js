import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as ImportTokenizer from '../ImportTokenizer/ImportTokenizer.js'
import { InvariantError } from '../InvariantError/InvariantError.js'
import * as JsonFile from '../JsonFile/JsonFile.js'
import * as TestFile from '../TestFile/TestFile.js'

const isValidCase = (file) => {
  return !file.endsWith('.gitkeep')
}

const withDefaults = (defaultConfig) => {
  const config = {
    skip: defaultConfig?.skip || [],
  }
  return config
}

export const run = async (root, argv) => {
  const start = performance.now()
  const extensionJsonPath = join(root, 'extension.json')
  const extensionJson = await JsonFile.readJson(extensionJsonPath)
  if (!extensionJson.languages) {
    throw new InvariantError('no languages found in extension manifest')
  }
  const packageJsonPath = join(root, 'package.json')
  const packageJson = await JsonFile.readJson(packageJsonPath)

  const config = withDefaults(packageJson['test-tokenize'])
  const language = extensionJson.languages[0]
  if (!language) {
    throw new InvariantError('no tokenize path found in extension manifest')
  }
  const tokenizePath = language.tokenize
  if (!tokenizePath) {
    throw new InvariantError('no tokenize path found in extension manifest')
  }
  const absoluteTokenizePath = join(root, tokenizePath)

  const fileUrl = pathToFileURL(absoluteTokenizePath).toString()
  const Tokenizer = await ImportTokenizer.importTokenizer(fileUrl)

  const casesPath = join(root, 'test', 'cases')

  const cases = await readdir(casesPath)
  const validCases = cases.filter(isValidCase)
  if (validCases.length === 0) {
    throw new InvariantError('no test cases found')
  }

  const stats = {
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    total: validCases.length,
  }
  for (const validCase of validCases) {
    const status = await TestFile.testFile({
      Tokenizer,
      config,
      file: validCase,
      root,
    })
    stats[status]++
  }
  const end = performance.now()
  const duration = end - start
  stats.duration = duration
  return stats
}

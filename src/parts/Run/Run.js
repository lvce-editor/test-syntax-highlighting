import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import * as ImportTokenizer from '../ImportTokenizer/ImportTokenizer.js'
import { InvariantError } from '../InvariantError/InvariantError.js'
import * as JsonFile from '../JsonFile/JsonFile.js'
import * as TestFiles from '../TestFiles/TestFiles.js'

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
  const Tokenizer = await ImportTokenizer.importTokenizer(absoluteTokenizePath)
  const casesPath = join(root, 'test', 'cases')
  const cases = await readdir(casesPath)
  const validCases = cases.filter(isValidCase)
  if (validCases.length === 0) {
    throw new InvariantError('no test cases found')
  }
  const stats = await TestFiles.testFiles(
    validCases,
    Tokenizer,
    config,
    root,
    start
  )
  return stats
}

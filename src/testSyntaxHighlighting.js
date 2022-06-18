import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const readJson = async (absolutePath) => {
  const content = await readFile(absolutePath, 'utf8')
  return JSON.parse(content)
}

class InvariantError extends Error {
  constructor(message) {
    super(message)
  }
}

const isValidCase = (file) => {
  return !file.endsWith('.gitkeep')
}

const run = async (root, argv) => {
  const extensionJsonPath = join(root, 'extension.json')
  const extensionJson = await readJson(extensionJsonPath)
  if (!extensionJson.languages) {
    throw new InvariantError('no languages found in extension manifest')
  }
  const language = extensionJson.languages[0]
  if (!language) {
    throw new InvariantError('no tokenize path found in extension manifest')
  }
  const tokenizePath = language.tokenize
  if (!tokenizePath) {
    throw new InvariantError('no tokenize path found in extension manifest')
  }
  const absoluteTokenizePath = join(root, tokenizePath)
  const Tokenize = await import(absoluteTokenizePath)

  const casesPath = join(root, 'test', 'cases')
  const baselinesPath = join(root, 'test', 'baselines')

  const cases = await readdir(casesPath)
  const validCases = cases.filter(isValidCase)
  if (validCases.length === 0) {
    throw new InvariantError('no test cases found')
  }
}

const main = async () => {
  try {
    await run(process.cwd(), process.argv)
  } catch (error) {
    if (error && error instanceof InvariantError) {
      console.error(error.message)
      process.exit(1)
    }
    throw error
  }
}

main()

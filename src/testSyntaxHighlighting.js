import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import splitLines from 'split-lines'

const ErrorCodes = {
  ENOENT: 'ENOENT',
  ERR_MODULE_NOT_FOUND: 'ERR_MODULE_NOT_FOUND',
}

const Logger = {
  info(...args) {
    console.info(...args)
  },
  error(...args) {
    console.error(...args)
  },
}

const JsonFile = {
  async readJson(absolutePath) {
    const content = await readFile(absolutePath, 'utf8')
    return JSON.parse(content)
  },
}

class InvariantError extends Error {
  constructor(message) {
    super(message)
  }
}

const isValidCase = (file) => {
  return !file.endsWith('.gitkeep')
}

const getTokenNamesWithArrayReturn = (Tokenizer, tokens) => {
  const tokenNames = []
  for (let i = 0; i < tokens.length; i += 2) {
    const tokenType = tokens[i]
    const tokenName = Tokenizer.TokenMap[tokenType]
    if (tokenName === undefined) {
      if (typeof tokenType !== 'number') {
        throw new Error(
          `token must be of type number, but was of type ${typeof tokenType}`
        )
      }
      throw new InvariantError(`TokenMap is missing property "${tokenType}"`)
    }
    tokenNames.push(tokenName)
  }
  return tokenNames
}

const getTokenNamesLegacy = (Tokenizer, tokens) => {
  const tokenNames = []
  for (const token of tokens) {
    const tokenType = token.type
    const tokenName = Tokenizer.TokenMap[tokenType]
    if (tokenName === undefined) {
      throw new InvariantError(`TokenMap is missing property "${tokenType}"`)
    }
    tokenNames.push(tokenName)
  }
  return tokenNames
}

const getTokenNames = (Tokenizer, tokens) => {
  if (!Tokenizer.TokenMap) {
    throw new InvariantError('tokenizer is missing export const TokenMap')
  }
  if (Tokenizer.hasArrayReturn) {
    return getTokenNamesWithArrayReturn(Tokenizer, tokens)
  }
  return getTokenNamesLegacy(Tokenizer, tokens)
}

const tokenizeLines = (text, Tokenizer) => {
  let lineState = {
    ...Tokenizer.initialLineState,
  }
  const tokens = []
  const lines = splitLines(text)
  for (let i = 0; i < lines.length; i++) {
    lineState = Tokenizer.tokenizeLine(lines[i], lineState)
    const tokenNames = getTokenNames(Tokenizer, lineState.tokens)
    tokens.push(...tokenNames)
    tokens.push('NewLine')
  }
  tokens.pop()
  return tokens.join('\n')
}

const testFile = async ({ Tokenizer, root, file, config }) => {
  const fileName = getFileName(file)
  if (config.skip.includes(fileName)) {
    return 'skipped'
  }
  const casePath = join(root, 'test', 'cases', file)
  const caseContent = await readFile(casePath, 'utf-8')
  let generated
  try {
    generated = tokenizeLines(caseContent, Tokenizer)
  } catch (error) {
    // @ts-ignore
    Logger.error(`tokenization failed for ${fileName}: ${error.message}`)
    return 'failed'
  }

  const baselinePath = join(root, 'test', 'baselines', fileName + '.txt')
  let baselineContent
  try {
    baselineContent = await readFile(baselinePath, 'utf-8')
    baselineContent = baselineContent.trim()
  } catch (error) {
    // @ts-ignore
    if (error && error.code === ErrorCodes.ENOENT) {
      await writeFile(baselinePath, generated)
      return 'passed'
    }
  }

  if (generated !== baselineContent) {
    Logger.error(`mismatch ${fileName}`)
    return 'failed'
  }
  return 'passed'
}

/**
 * @param {string} fileNameWithExtension
 */
const getFileName = (fileNameWithExtension) => {
  const fileName = parse(fileNameWithExtension).name
  return fileName
}

const withDefaults = (defaultConfig) => {
  const config = {
    skip: defaultConfig?.skip || [],
  }
  return config
}

const isModuleNotFoundError = (error) => {
  return error && error.code === ErrorCodes.ERR_MODULE_NOT_FOUND
}

const importTokenizer = async (url) => {
  try {
    return await import(url)
  } catch (error) {
    if (isModuleNotFoundError(error)) {
      // TODO print code frame of extension.json
      // with cursor under the tokenizer property
      const path = fileURLToPath(url)
      throw new InvariantError(`tokenizer file not found: "${path}"`)
    }
    throw error
  }
}

const run = async (root, argv) => {
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
  const Tokenizer = await importTokenizer(fileUrl)

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
  }
  for (const validCase of validCases) {
    const status = await testFile({
      Tokenizer,
      config,
      file: validCase,
      root,
    })
    stats[status]++
  }
  const end = performance.now()
  const duration = end - start
  if (stats.failed) {
    if (stats.failed === 1) {
      Logger.info(`1 test failed, ${stats.passed} tests passed`)
    } else {
      Logger.info(
        `${stats.failed} tests failed, ${stats.passed} tests passed in ${duration}ms`
      )
    }
    process.exit(1)
  } else if (stats.skipped) {
    if (stats.skipped === 1) {
      Logger.info(
        `1 test skipped, ${stats.passed} tests passed in ${duration}ms`
      )
    } else {
      Logger.info(
        `${stats.skipped} tests skipped, ${stats.passed} tests passed in ${duration}ms`
      )
    }
  } else {
    if (stats.passed === 1) {
      Logger.info(`1 test passed in ${duration}ms`)
    } else {
      Logger.info(`${validCases.length} tests passed in ${duration}ms`)
    }
  }
}

const main = async () => {
  try {
    await run(process.cwd(), process.argv)
  } catch (error) {
    if (error && error instanceof InvariantError) {
      Logger.error(error.message)
      process.exit(1)
    }
    throw error
  }
}

main()

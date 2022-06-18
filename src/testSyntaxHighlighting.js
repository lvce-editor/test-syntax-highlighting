import { readdir, readFile, writeFile } from 'fs/promises'
import { join, parse } from 'path'

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

const tokenizeLines = (text, Tokenizer) => {
  const getName = (token) => {
    return Tokenizer.TokenMap[token.type]
  }
  const lineState = {
    state: Tokenizer.initialLineState.state,
  }
  const tokens = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const result = Tokenizer.tokenizeLine(lines[i], lineState)
    lineState.state = result.state
    tokens.push(...result.tokens.map(getName))
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
    console.error(`tokenization failed for ${fileName}: ${error.message}`)
    return 'failed'
  }

  const baselinePath = join(root, 'test', 'baselines', fileName + '.txt')
  let baselineContent
  try {
    baselineContent = await readFile(baselinePath, 'utf-8')
    baselineContent = baselineContent.trim()
  } catch (error) {
    // @ts-ignore
    if (error && error.code === 'ENOENT') {
      await writeFile(baselinePath, generated)
      return 'passed'
    }
  }

  if (generated !== baselineContent) {
    console.error(`mismatch ${fileName} `)
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

const run = async (root, argv) => {
  const start = performance.now()
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
  const Tokenizer = await import(absoluteTokenizePath)

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
      config: { skip: [] },
      file: validCase,
      root,
    })
    stats[status]++
  }
  const end = performance.now()
  const duration = end - start
  if (stats.failed) {
    if (stats.failed === 1) {
      console.info(`1 test failed, ${stats.passed} tests passed`)
    } else {
      console.info(`${stats.failed} tests failed, ${stats.passed} tests passed`)
    }
    process.exit(1)
  } else if (stats.skipped) {
    console.info(
      `${stats.skipped} tests skipped, ${stats.passed} tests passed in ${duration}ms`
    )
  } else {
    if (stats.passed === 1) {
      console.info(`1 test passed in ${duration}ms`)
    } else {
      console.info(`${validCases.length} tests passed in ${duration}ms`)
    }
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

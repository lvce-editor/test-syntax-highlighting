import { watchFile } from 'fs'
import { readdir, readFile, watch, writeFile } from 'fs/promises'
import { join, parse } from 'path'
import splitLines from 'split-lines'
import { setTimeout } from 'timers/promises'
import { pathToFileURL } from 'url'

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
    ...Tokenizer.initialLineState,
  }
  const tokens = []
  const lines = splitLines(text)
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
    console.error(`mismatch ${fileName}`)
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

const runOnce = async (root) => {
  const start = performance.now()
  const extensionJsonPath = join(root, 'extension.json')
  const extensionJson = await readJson(extensionJsonPath)
  if (!extensionJson.languages) {
    throw new InvariantError('no languages found in extension manifest')
  }
  const packageJsonPath = join(root, 'package.json')
  const packageJson = await readJson(packageJsonPath)

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
  const Tokenizer = await import(fileUrl)

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
      return {
        message: `1 test failed, ${stats.passed} tests passed`,
        exitCode: 1,
      }
    }
    return {
      message: `${stats.failed} tests failed, ${stats.passed} tests passed in ${duration}ms`,
      exitCode: 1,
    }
  }
  if (stats.skipped) {
    if (stats.skipped === 1) {
      return {
        message: `1 test skipped, ${stats.passed} tests passed in ${duration}ms`,
        exitCode: 0,
      }
    }
    return {
      message: `${stats.skipped} tests skipped, ${stats.passed} tests passed in ${duration}ms`,
      exitCode: 0,
    }
  }
  if (stats.passed === 1) {
    return {
      message: `1 test passed in ${duration}ms`,
      exitCode: 0,
    }
  }
  return {
    exitCode: 0,
    message: `${validCases.length} tests passed in ${duration}ms`,
  }
}

const isLinux = () => {
  return process.platform === 'linux'
}

const createFileWatcherLinux = (file, callback) => {
  // TODO interval watching is too slow
  // maybe need a library like chokidar for file watch
  // but that might result more dependencies
  watchFile(file, {}, callback)
}

const createFileWatchersLinux = async (root, callback) => {
  console.log({ root })
  const files = await readdir(root, { withFileTypes: true })

  for (const file of files) {
    const absolutePath = join(root, file.name)
    console.log({ absolutePath })
    if (file.isFile()) {
      createFileWatcherLinux(absolutePath, callback)
    } else if (file.isDirectory()) {
      createFileWatchersLinux(absolutePath, callback)
    }
  }
}

const createWatcher = async (root, callback) => {
  if (isLinux()) {
    await createFileWatchersLinux(root, callback)
  } else {
    const watcher = watch(root, { recursive: true })
    console.log('watching', root)
    for await (const event of watcher) {
      await callback()
    }
  }
}

const run = async (root, argv) => {
  const watch = argv.includes('--watch')
  if (watch) {
    const { exitCode, message } = await runOnce(root)
    console.info(message)
    const handleChange = async () => {
      console.log('change')
      const { exitCode, message } = await runOnce(root)
      // process.stdout.moveCursor(0, -1)
      // process.stdout.clearLine(0)
      console.info(message)
    }
    const src = join(root, 'src')
    const test = join(root, 'test')
    createWatcher(src, handleChange)
    createWatcher(test, handleChange)
  } else {
    const { exitCode, message } = await runOnce(root)
    console.info(message)
    process.exit(exitCode)
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

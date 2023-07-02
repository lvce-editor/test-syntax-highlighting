import { readFile, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'
import * as Logger from '../Logger/Logger.js'
import * as TokenizeLines from '../TokenizeLines/TokenizeLines.js'
import * as TestStatus from '../TestStatus/TestStatus.js'

/**
 * @param {string} fileNameWithExtension
 */
const getFileName = (fileNameWithExtension) => {
  const fileName = parse(fileNameWithExtension).name
  return fileName
}

export const testFile = async ({ Tokenizer, root, file, config }) => {
  const fileName = getFileName(file)
  if (config.skip.includes(fileName)) {
    return TestStatus.Skipped
  }
  const casePath = join(root, 'test', 'cases', file)
  const caseContent = await readFile(casePath, 'utf-8')
  let generated
  try {
    generated = TokenizeLines.tokenizeLines(caseContent, Tokenizer)
  } catch (error) {
    // @ts-ignore
    Logger.error(`tokenization failed for ${fileName}: ${error.message}`)
    return TestStatus.Failed
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
      return TestStatus.Passed
    }
  }

  if (generated !== baselineContent) {
    Logger.error(`mismatch ${fileName}`)
    return TestStatus.Failed
  }
  return TestStatus.Passed
}

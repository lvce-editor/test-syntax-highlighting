import * as TestFile from '../TestFile/TestFile.js'

export const testFiles = async (validCases, Tokenizer, config, root, start) => {
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

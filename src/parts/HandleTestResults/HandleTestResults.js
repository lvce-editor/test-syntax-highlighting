import * as Logger from '../Logger/Logger.js'

export const handleTestResults = (stats) => {
  const { failed, passed, skipped, duration, total } = stats
  if (failed) {
    if (failed === 1) {
      Logger.info(`1 test failed, ${passed} tests passed`)
    } else {
      Logger.info(
        `${failed} tests failed, ${passed} tests passed in ${duration}ms`
      )
    }
    process.exit(1)
  } else if (skipped) {
    if (skipped === 1) {
      Logger.info(`1 test skipped, ${passed} tests passed in ${duration}ms`)
    } else {
      Logger.info(
        `${skipped} tests skipped, ${passed} tests passed in ${duration}ms`
      )
    }
  } else {
    if (passed === 1) {
      Logger.info(`1 test passed in ${duration}ms`)
    } else {
      Logger.info(`${total} tests passed in ${duration}ms`)
    }
  }
}

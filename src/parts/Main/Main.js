import { InvariantError } from '../InvariantError/InvariantError.js'
import * as Logger from '../Logger/Logger.js'
import * as Run from '../Run/Run.js'

export const main = async () => {
  try {
    await Run.run(process.cwd(), process.argv)
  } catch (error) {
    if (error && error instanceof InvariantError) {
      Logger.error(error.message)
      process.exit(1)
    }
    throw error
  }
}

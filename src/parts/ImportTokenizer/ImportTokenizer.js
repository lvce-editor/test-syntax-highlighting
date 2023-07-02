import { fileURLToPath } from 'node:url'
import { InvariantError } from '../InvariantError/InvariantError.js'
import * as IsModuleNotFoundError from '../IsModuleNotFoundError/IsModuleNotFoundError.js'

export const importTokenizer = async (url) => {
  try {
    return await import(url)
  } catch (error) {
    if (IsModuleNotFoundError.isModuleNotFoundError(error)) {
      // TODO print code frame of extension.json
      // with cursor under the tokenizer property
      const path = fileURLToPath(url)
      throw new InvariantError(`tokenizer file not found: "${path}"`)
    }
    throw error
  }
}

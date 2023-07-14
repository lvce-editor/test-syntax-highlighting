import { pathToFileURL } from 'node:url'
import { InvariantError } from '../InvariantError/InvariantError.js'
import * as IsModuleNotFoundError from '../IsModuleNotFoundError/IsModuleNotFoundError.js'

export const importTokenizer = async (path) => {
  try {
    const url = pathToFileURL(path).toString()
    return await import(url)
  } catch (error) {
    if (IsModuleNotFoundError.isModuleNotFoundError(error)) {
      // TODO print code frame of extension.json
      // with cursor under the tokenizer property
      throw new InvariantError(`tokenizer file not found: "${path}"`)
    }
    throw error
  }
}

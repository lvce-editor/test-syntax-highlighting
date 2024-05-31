import * as ImportScript from '../ImportScript/ImportScript.js'
import { InvariantError } from '../InvariantError/InvariantError.js'
import * as IsModuleNotFoundError from '../IsModuleNotFoundError/IsModuleNotFoundError.js'

export const importTokenizer = async (path) => {
  try {
    return await ImportScript.importScript(path)
  } catch (error) {
    if (IsModuleNotFoundError.isModuleNotFoundError(error)) {
      // TODO print code frame of extension.json
      // with cursor under the tokenizer property
      throw new InvariantError(`tokenizer file not found: "${path}"`)
    }
    throw error
  }
}
